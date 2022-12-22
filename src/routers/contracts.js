const express = require('express');
const router = express.Router();
const { getProfile } = require('../middleware/getProfile');
const checkParams = require('../middleware/checkParams');
const Sequelize = require('sequelize');
const Op = Sequelize.Op;
const ContractModule = require('../models/contract');
const { param, header } = require('express-validator');
const asyncHandler = require('express-async-handler');

/**
 * @returns contract by id
 */
router.get('/:id', [
  param('id', 'invalid contract id').isInt({ min: 1, allow_leading_zeroes: false }),
  header('profile_id', 'invalid profile_id').isInt({ min: 1, allow_leading_zeroes: false }),
], checkParams, getProfile, asyncHandler(async (req, res) => {
  const { Contract } = req.app.get('models');
  const { id } = req.params;
  const contract = await Contract.findOne({
    where: {
      id,
      [Op.or]: {
        contractorId: req.profile.id,
        clientId: req.profile.id,
      },
    },
  });
  if (!contract) return res.status(404).end();
  res.json(contract);
}));

/**
 * @returns Returns a list of contracts belonging to a user
 *  (client or contractor),
 *  the list contains non terminated contracts.
 */
router.get('/', [
  header('profile_id', 'invalid profile_id').isInt({ min: 1, allow_leading_zeroes: false }),
], checkParams, getProfile, asyncHandler(async (req, res) => {
  const { Contract } = req.app.get('models');
  const contracts = await Contract.findAll({
    where: {
      [Op.or]: {
        contractorId: req.profile.id,
        clientId: req.profile.id,
      },
      status: {
        [Op.not]: ContractModule.statuses.Terminated,
      },
    },
  });
  if (!contracts.length) return res.status(404).end();
  res.json(contracts);
}));

module.exports = router;
