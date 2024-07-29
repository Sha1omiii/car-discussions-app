const User = require('../model/user');
const bcrypt = require('bcrypt');
// const jwt = require('jsonwebtoken');
const dotenv = require('dotenv').config();

// this will add our registered users to the database
const register = async (req, res) => {
    const { username, password } = req.body;
    if (password.length < 5) {
        return res.status(400).json({
            message: "Check your password, it should be more than 5 characters.",
        });
    }
    try {
        const hashedPassword = await bcrypt.hash(password, 10);
        const user = await User.create({
            username,
            password: hashedPassword,
        });

        return res.status(201).json({
            message: 'User successfully created',
            user: user._id,
        });
    } catch (e) {
        return res.status(500).json({
            message: 'User not created.',
            error: e.message,
        });
    }
}


const login = async (req, res) => {
    const { username, password } = req.body;
    console.log('request', username, password);
    if (!username || !password) {
        return res.status(400).json({
            message: "You didn't provide username and password",
        });
    }
    try {
        const user = await User.findOne({ username });
        if (!user) {
            return res.status(401).json({
                message: "Login unsuccessful",
                error: "User not found",
            });
        }

        const passwordMatch = await bcrypt.compare(password, user.password);
        if (passwordMatch) {
            req.session.user = {
                _id: user._id,
                username: user.username,
                role: user.role
            };
            if (user.role === 'admin') {
                return res.redirect('/admin');
            }
            return res.json({ role: user.role });
        } else {
            return res.status(401).json({ message: 'Unsuccessful login' });
        }
    } catch (error) {
        return res.status(500).json({
            message: "Error occurred",
            error: error.message,
        });
    }
}

//admin only
const userRole = async (req, res) => {
    const { role, id } = req.body;
    if (role && id) {
        if (role === 'admin') { // role.value = admin??
            try {
                const user = await User.findById(id);
                if (!user) res.json({ message: 'no user found.' })

                if (user.role !== 'admin') { // user is not an admin
                    user.role = role;
                    await user.save();
                    res.json({ message: 'userrole updated successfully' });
                } else {
                    res.json({ message: 'The user is already an admin' })
                }
            } 
            catch(e) {
                res.json({ message: 'Some Error', error: e.message })
            }
        } else {
            res.json({
                 message: 'Not an admin role.',
            });
        }
    } else {
        res.json({ message: 'Role or Id or both not present' });
    }
}
//admin only
const deleteSpecificUser = async (req, res) => {
    const { id } = req.body;
    const user = await User.findByIdAndDelete(id);
    res.json({ message: "deleted",
        user
    })
}
//admin only
const allRegisteredUsers = async (req, res, next) => {
    try {
        const users =  await User.find({});
        const userFn = users.map(user => {
            return {
                username: user.username,
                role: user.role
            }
        });
        res.status(200).json({ user: userFn });
    } catch (e) {
        res.status(401).json({ message: 'Not successful', error: e.message });
    }
}

module.exports = { register, login, userRole, deleteSpecificUser, allRegisteredUsers }