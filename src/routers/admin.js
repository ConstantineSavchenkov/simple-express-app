const express = require('express');
const router = express.Router();
const { getProfile } = require('../middleware/getProfile');
const Sequelize = require('sequelize');
const Op = Sequelize.Op;
const checkParams = require('../middleware/checkParams');
const { query, header } = require('express-validator');
const moment = require('moment');

/**
 * @returns profession that earned the most money
 */
router.get('/best-profession', [
  query('start', 'invalid start date').custom((value) => moment(value).isValid()),
  query('end', 'invalid end date').custom((value) => moment(value).isValid()),
  header('profile_id', 'invalid profile_id').isInt({ min: 1, allow_leading_zeroes: false }),
], checkParams, getProfile, async (req, res) => {
  const { Contract, Profile, Job } = req.app.get('models');
  const { start, end } = req.query;
  const sequelize = req.app.get('sequelize');

  const results = await Job.findAll({
    where: {
      paid: true,
      paymentDate: {
        [Op.between]: [start, end],
      },
    },
    include: [{
      model: Contract,
      attributes: [],
      required: true,
      include: [
        {
          model: Profile, as: 'Contractor',
          required: true,
          attributes: [],
        },
      ],
    }],
    raw: true,
    attributes: [
      [sequelize.fn('sum', sequelize.col('price')), 'total'],
      [sequelize.col('Contract.Contractor.profession'), 'profession'],
    ],
    group: ['profession'],
    order: [['total', 'DESC']],
  });

  if (!results.length) return res.status(404).end();

  res.json(results[0].profession);
});

/**
 * @returns clients the paid the most for jobs
 */
router.get('/best-clients', [
  query('start', 'invalid start date').custom((value) => moment(value).isValid()),
  query('end', 'invalid end date').custom((value) => moment(value).isValid()),
  query('limit', 'invalid limit').isInt({ min: 1, allow_leading_zeroes: false }),
  header('profile_id', 'invalid profile_id').isInt({ min: 1, allow_leading_zeroes: false }),
], checkParams, getProfile, async (req, res) => {
  const { Contract, Profile, Job } = req.app.get('models');
  const { start, end, limit } = req.query;
  const sequelize = req.app.get('sequelize');

  const results = await Job.findAll({
    limit: limit || 2,
    raw: true,
    where: {
      paid: true,
      paymentDate: {
        [Op.between]: [start, end],
      },
    },
    include: [{
      model: Contract,
      attributes: [],
      required: true,
      include: [
        {
          model: Profile, as: 'Client',
          required: true,
          attributes: [],
        },
      ],
    }],
    attributes: [
      [sequelize.col('Contract.Client.id'), 'id'],
      [sequelize.literal('`Contract->Client`.`firstName` || \' \' || `Contract->Client`.`lastName`'),
        'fullName'],
      [sequelize.fn('sum', sequelize.col('price')), 'paid'],
    ],
    group: ['Contract.Client.id'],
    order: [['paid', 'DESC']],
  });

  if (!results.length) return res.status(404).end();

  res.json(results);
});

module.exports = router;
