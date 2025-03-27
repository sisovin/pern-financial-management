const Joi = require('joi');

const incomeSchema = Joi.object({
  amount: Joi.number().positive().required(),
});

const expenseSchema = Joi.object({
  amount: Joi.number().positive().required(),
});

const savingSchema = Joi.object({
  amount: Joi.number().positive().required(),
});

module.exports = {
  incomeSchema,
  expenseSchema,
  savingSchema,
};
