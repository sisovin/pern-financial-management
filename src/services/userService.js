const prisma = require('../config/db');
const dotenv = require('dotenv');

dotenv.config();

const getUserProfile = async (userId) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: userId },
    });
    return user;
  } catch (error) {
    throw new Error('Failed to fetch user profile');
  }
};

const updateUserProfile = async (userId, data) => {
  try {
    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data,
    });
    return updatedUser;
  } catch (error) {
    throw new Error('Failed to update user profile');
  }
};

const deleteUserProfile = async (userId) => {
  try {
    await prisma.user.update({
      where: { id: userId },
      data: { deleted: true },
    });
    return { message: 'User profile deleted' };
  } catch (error) {
    throw new Error('Failed to delete user profile');
  }
};

module.exports = {
  getUserProfile,
  updateUserProfile,
  deleteUserProfile,
};
