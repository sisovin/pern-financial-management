const Joi = require('joi');

const userProfileSchema = Joi.object({
  username: Joi.string().alphanum().min(3).max(30).required(),
  email: Joi.string().email().required(),
  password: Joi.string().min(8).required(),
});

const updateUserProfileSchema = Joi.object({
  username: Joi.string().alphanum().min(3).max(30),
  email: Joi.string().email(),
  password: Joi.string().min(8),
});

const deleteUserProfileSchema = Joi.object({
  userId: Joi.number().integer().required(),
});

module.exports = {
  userProfileSchema,
  updateUserProfileSchema,
  deleteUserProfileSchema,
};
