const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');

// CRUD (Admin endpoints)
router
  .route('/')
  .get(userController.getAllUsers)
  .post(userController.createUser);

router
  .route('/:id')
  .get(userController.geUserById)
  .patch(userController.updateUserById)
  .delete(userController.deleteUserById);

module.exports = router;
