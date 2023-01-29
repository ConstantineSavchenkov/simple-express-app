const express = require('express');
const router = express.Router();
const { getProfile } = require('../middleware/getProfile');
const Sequelize = require('sequelize');
const Op = Sequelize.Op;
const ContractModule = require('../models/contract');
const asyncHandler = require('express-async-handler');
const checkParams = require('../middleware/checkParams');
const { param, header } = require('express-validator');

/**
 * Deposits money into the the the balance of a client
 */
router.post('/deposit/:userId', [
  param('userId', 'invalid userId').isInt({ min: 1, allow_leading_zeroes: false }),
  header('profile_id', 'invalid profile_id').isInt({ min: 1, allow_leading_zeroes: false }),
], checkParams, getProfile, asyncHandler(async (req, res) => {
  const amount = req.body.amount;
  const { userId } = req.params;
  const { Contract, Job, Profile } = req.app.get('models');
  const sequelize = req.app.get('sequelize');

  if (req.profile.id.toString() !== userId) {
    // assuming user only can deposit money to himself
    return res.status(403).end();
  }

  const results = await Job.findAll({
    where: {
      paid: false,
    },
    include: [{
      model: Contract,
      required: true,
      attributes: [],
      where: {
        clientId: req.profile.id,
        status: {
          [Op.not]: ContractModule.statuses.Terminated,
        },
      },
    }],
    attributes: [
      [sequelize.fn('sum', sequelize.col('price')), 'overallToPay'],
    ],
  });

  if (!results.length) return res.status(400).end();

  const [result] = results;
  const overallToPay = result.dataValues.overallToPay;

  if ((amount / overallToPay) * 100 > 25) {
    return res.status(400).end();
  }

  const t = await sequelize.transaction();

  try {
    await Profile.update(
        {
          balance: req.profile.balance + amount,
        },
        {
          where: {
            id: req.profile.id,
          },
        }
        , { transaction: t });

    await t.commit();
  } catch (e) {
    // fancy log here
    console.error(e);
    await t.rollback();
    throw error;
  }

  res.end();
}));


module.exports = router;
