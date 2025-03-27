const prisma = require('../config/db');
const jwt = require('jsonwebtoken');
const argon2 = require('argon2');
const redisClient = require('../config/redis');
const dotenv = require('dotenv');

dotenv.config();

const signup = async (username, password) => {
  const hashedPassword = await argon2.hash(password);
  const user = await prisma.user.create({
    data: {
      username,
      password: hashedPassword,
    },
  });
  return user;
};

const login = async (username, password) => {
  const user = await prisma.user.findUnique({
    where: { username },
  });

  if (!user) {
    throw new Error('User not found');
  }

  const isPasswordValid = await argon2.verify(user.password, password);
  if (!isPasswordValid) {
    throw new Error('Invalid credentials');
  }

  const token = jwt.sign({ userId: user.id, role: user.role }, process.env.JWT_SECRET, { expiresIn: '1h' });
  return token;
};

const enable2FA = async (userId, secret) => {
  await prisma.user.update({
    where: { id: userId },
    data: { twoFactorSecret: secret },
  });
};

const verify2FA = async (userId, token) => {
  const user = await prisma.user.findUnique({
    where: { id: userId },
  });

  if (!user) {
    throw new Error('User not found');
  }

  // Verify 2FA token logic
  // ...

  return true;
};

module.exports = {
  signup,
  login,
  enable2FA,
  verify2FA,
};
