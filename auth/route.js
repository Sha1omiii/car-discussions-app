const express = require('express');
const router = express.Router();
const { register, login, userRole, deleteSpecificUser } = require('./auth');
const { authenticateAdmin } = require('../middleware/auth');

router.route('/register').post(register);
router.route('/login').post(login);
router.route('/update').put(authenticateAdmin, userRole); // only an admin can change user roles and delete users
router.route('/delete').delete(authenticateAdmin, deleteSpecificUser);

module.exports = router;