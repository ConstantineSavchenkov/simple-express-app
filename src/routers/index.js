const express = require('express');
const contracts = require('./contracts');
const balances = require('./balances');
const admin = require('./admin');
const jobs = require('./jobs');
const router = express.Router();

router.use('/contracts', contracts);
router.use('/jobs', jobs);
router.use('/balances', balances);
router.use('/admin', admin);

module.exports = router;
