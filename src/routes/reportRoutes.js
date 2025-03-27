const express = require('express');
const reportController = require('../controllers/reportController');

const router = express.Router();

router.get('/csv', reportController.generateCSVReport);
router.get('/pdf', reportController.generatePDFReport);

module.exports = router;
