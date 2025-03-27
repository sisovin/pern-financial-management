const argon2 = require('argon2');

const hashPassword = async (password) => {
  try {
    const hash = await argon2.hash(password);
    return hash;
  } catch (err) {
    throw new Error('Error hashing password');
  }
};

const verifyPassword = async (hash, password) => {
  try {
    const isMatch = await argon2.verify(hash, password);
    return isMatch;
  } catch (err) {
    throw new Error('Error verifying password');
  }
};

module.exports = {
  hashPassword,
  verifyPassword,
};
