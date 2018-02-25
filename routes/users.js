const express = require('express');

const router = express.Router();

const checkAuth = require('../middleware/check-auth');

const UsersController = require('../controllers/users');

router.post('/signup', UsersController.usersSignup);
router.post('/login', UsersController.usersLogin);
router.delete('/:userId', checkAuth, UsersController.usersDeleteUser);

module.exports = router;
