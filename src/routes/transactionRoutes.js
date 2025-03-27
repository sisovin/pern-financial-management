const express = require('express');
const transactionController = require('../controllers/transactionController');

const router = express.Router();

router.post('/income', transactionController.createIncome);
router.post('/expenses', transactionController.createExpense);
router.post('/savings', transactionController.createSaving);
router.get('/income', transactionController.getIncomes);
router.get('/expenses', transactionController.getExpenses);
router.get('/savings', transactionController.getSavings);

module.exports = router;
