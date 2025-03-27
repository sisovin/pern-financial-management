const express = require('express');
const goalController = require('../controllers/goalController');

const router = express.Router();

router.post('/', goalController.createGoal);
router.get('/', goalController.getGoals);
router.put('/:id', goalController.updateGoal);
router.delete('/:id', goalController.deleteGoal);

module.exports = router;
