const prisma = require('../config/db');
const dotenv = require('dotenv');

dotenv.config();

const createGoal = async (userId, name, target) => {
  try {
    const goal = await prisma.goal.create({
      data: {
        userId,
        name,
        target,
      },
    });
    return goal;
  } catch (error) {
    throw new Error('Failed to create goal');
  }
};

const getGoals = async (userId) => {
  try {
    const goals = await prisma.goal.findMany({
      where: { userId },
    });
    return goals;
  } catch (error) {
    throw new Error('Failed to fetch goals');
  }
};

const updateGoal = async (id, data) => {
  try {
    const updatedGoal = await prisma.goal.update({
      where: { id: parseInt(id) },
      data,
    });
    return updatedGoal;
  } catch (error) {
    throw new Error('Failed to update goal');
  }
};

const deleteGoal = async (id) => {
  try {
    await prisma.goal.delete({
      where: { id: parseInt(id) },
    });
    return { message: 'Goal deleted' };
  } catch (error) {
    throw new Error('Failed to delete goal');
  }
};

module.exports = {
  createGoal,
  getGoals,
  updateGoal,
  deleteGoal,
};
