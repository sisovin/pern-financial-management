const prisma = require('../config/db');
const dotenv = require('dotenv');

dotenv.config();

const getUserProfile = async (req, res) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user.id },
    });
    res.json(user);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch user profile' });
  }
};

const updateUserProfile = async (req, res) => {
  try {
    const updatedUser = await prisma.user.update({
      where: { id: req.user.id },
      data: req.body,
    });
    res.json(updatedUser);
  } catch (error) {
    res.status(500).json({ error: 'Failed to update user profile' });
  }
};

const deleteUserProfile = async (req, res) => {
  try {
    await prisma.user.update({
      where: { id: req.user.id },
      data: { deleted: true },
    });
    res.json({ message: 'User profile deleted' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete user profile' });
  }
};

module.exports = {
  getUserProfile,
  updateUserProfile,
  deleteUserProfile,
};
