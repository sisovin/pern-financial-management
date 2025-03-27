const prisma = require('../config/db');
const dotenv = require('dotenv');

dotenv.config();

const createGoal = async (req, res) => {
  const { name, target } = req.body;
  const userId = req.user.id;

  try {
    const goal = await prisma.goal.create({
      data: {
        name,
        target,
        userId,
      },
    });
    res.status(201).json(goal);
  } catch (error) {
    res.status(500).json({ error: 'Failed to create goal' });
  }
};

const getGoals = async (req, res) => {
  const userId = req.user.id;

  try {
    const goals = await prisma.goal.findMany({
      where: { userId },
    });
    res.json(goals);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch goals' });
  }
};

const updateGoal = async (req, res) => {
  const { id } = req.params;
  const { name, target, progress } = req.body;

  try {
    const updatedGoal = await prisma.goal.update({
      where: { id: parseInt(id) },
      data: { name, target, progress },
    });
    res.json(updatedGoal);
  } catch (error) {
    res.status(500).json({ error: 'Failed to update goal' });
  }
};

const deleteGoal = async (req, res) => {
  const { id } = req.params;

  try {
    await prisma.goal.delete({
      where: { id: parseInt(id) },
    });
    res.json({ message: 'Goal deleted' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete goal' });
  }
};

module.exports = {
  createGoal,
  getGoals,
  updateGoal,
  deleteGoal,
};
