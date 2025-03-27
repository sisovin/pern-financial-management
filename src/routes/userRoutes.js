const express = require('express');
const userController = require('../controllers/userController');

const router = express.Router();

router.get('/profile', userController.getUserProfile);
router.put('/profile', userController.updateUserProfile);
router.delete('/profile', userController.deleteUserProfile);

module.exports = router;
