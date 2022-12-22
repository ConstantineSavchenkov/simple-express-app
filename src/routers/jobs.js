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
 * @returns all unpaid jobs for a user
 */
router.get('/unpaid', [
  header('profile_id', 'invalid profile_id').isInt({ min: 1, allow_leading_zeroes: false }),
], checkParams, getProfile, asyncHandler(async (req, res) => {
  const { Contract, Job } = req.app.get('models');
  const jobs = await Job.findAll({
    where: {
      paid: false,
    },
    include: [{
      model: Contract,
      required: true,
      attributes: [],
      where: {
        [Op.or]: {
          contractorId: req.profile.id,
          clientId: req.profile.id,
        },
        status: {
          [Op.not]: ContractModule.statuses.Terminated,
        },
      },
    }],
  });
  if (!jobs.length) return res.status(404).end();
  res.json(jobs);
}));

/**
 * Pay for a job
 */
router.post('/:id/pay', [
  param('id', 'invalid contract id').isInt({ min: 1, allow_leading_zeroes: false }),
  header('profile_id', 'invalid profile_id').isInt({ min: 1, allow_leading_zeroes: false }),
], checkParams, getProfile, asyncHandler(async (req, res) => {
  const amount = req.body.amount;
  const { id } = req.params;
  const { Contract, Job, Profile } = req.app.get('models');
  const sequelize = req.app.get('sequelize');

  if (req.profile.balance < amount) {
    return res.status(400).end();
  }

  const job = await Job.findOne({
    where: {
      id,
    },
    include: [{
      model: Contract,
      required: true,
      where: {
        clientId: req.profile.id,
        status: {
          [Op.not]: ContractModule.statuses.Terminated,
        },
      },
      include: [
        {
          model: Profile, as: 'Contractor',
          required: true,
          attributes: ['id', 'balance'],
        },
      ],
    }],
  });

  if (!job || !job.id) return res.status(404).end();

  const t = await sequelize.transaction();

  try {
    await Profile.update(
        {
          balance: req.profile.balance - amount,
        },
        {
          where: {
            id: req.profile.id,
          },
        }
        , { transaction: t });

    await Profile.update(
        {
          balance: job.Contract.Contractor.balance + amount,
        },
        {
          where: {
            id: job.Contract.Contractor.id,
          },
        }, { transaction: t });

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
