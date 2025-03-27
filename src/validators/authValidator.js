const Joi = require('joi');

const signupSchema = Joi.object({
  username: Joi.string().min(3).max(30).required(),
  password: Joi.string().min(8).required(),
});

const loginSchema = Joi.object({
  username: Joi.string().min(3).max(30).required(),
  password: Joi.string().min(8).required(),
});

const twoFactorAuthSchema = Joi.object({
  token: Joi.string().length(6).required(),
});

module.exports = {
  signupSchema,
  loginSchema,
  twoFactorAuthSchema,
};
