const express = require('express');
const router = express.Router();
const { register, login, userRole, deleteSpecificUser } = require('./auth');
const { authenticateAdmin } = require('../middleware/auth');
const User = require('../model/user');

router.post('/register', register);
router.post('/login', login);
// an admin can only change userroles
router.put('/update', authenticateAdmin, userRole);
router.delete('/delete', authenticateAdmin, deleteSpecificUser);
router.get('/getUsers', authenticateAdmin, async (req, res) => {
    try {
        const users = await User.find();
        res.json({ users });
    } catch (e) {
        console.log(e);
    }
})

module.exports = router;