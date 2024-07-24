const User = require('../model/user');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const dotenv = require('dotenv').config();

// this will add our registered users to the database
const register = async (req, res, next) => {
    const { username, password } = req.body;
    if (password.length < 5) {
        return res.status(400).json({
            message: "Check your password, it should be more than 5 characters."
        });
    }
    try {
        // bcrypt takes your password and hashes it specific times (10 in this case)
        // the bigger the number, the more time bcrypt will take to hash the pwd
        const hashedPassword = await bcrypt.hash(password, 10);
        const user = await User.create({
            username, 
            password: hashedPassword,
        });

        const maxAge = 60 * 60; //jwt token (live for 1 hr)
        //jwt.sign -- creates a JWT
        // 1st param - information we want to include in the token like our id, username, role
        //  SHOULD NOT HOLD PASSWORDS OR ANY SENSITIVE INFORMATION
        // 2nd param - a secret key used to sign the token and is used to verify the tokens authenticity
        // 3rd param - options like expiresIn, which tells how long the token is valid for 
        const token = jwt.sign(
            {id: user._id, username, role: user.role}, process.env.SECRET_STRING,
            {expiresIn: maxAge}
        );

        // sets a cookie on the client side
        // takes 3 params
        // 1st - name of the cookie
        // 2d - value we want to store in the token
        // 3rd - options like httpOnl: true makes the cookie only accessible through http requests
        // and maxAge is just the expiration of the cookie
        res.cookie('jwt', token, {
            httpOnly: true,
            maxAge: maxAge * 1000,
        });

        res.status(201).json({ 
            message: 'User Created',
            user: user._id,
        });
    } catch (e) {
        res.status(500).json({
            message: 'User not created.', 
            error: e.message,
        });
    }
}

// now I need a way to authenticate user credentials to see if my user is registered
// and check if the password provided is the same as the db hashed pwd, if so
// send a message indicating success in the login process
const login = async (req, res) => {
    const { username, password } = req.body;
    if (!username || !password) {
        return res.status(400).json({
            message: "You didn't proivde username and password",
        });
    }
    try {
        const user = await User.findOne({ username })
        if(!user) {
            res.status(401).json({
                message: "Login unsuccessful",
                error: "user not found"
            });
        } else {
            const passwordMatch = await bcrypt.compare(password, user.password);
            if (passwordMatch) {
                const maxAge = 60 * 60;
                const token = jwt.sign(
                    { id: user._id, username, role: user.role }, 
                    process.env.SECRET_STRING,
                    { expiresIn: maxAge }
                );

                console.log('Token: ', token);

                res.cookie('jwt', token, {
                    httpOnly: true, maxAge: maxAge * 1000,
                });

                res.status(200).json({ message: 'Successfully logged-in ', user: user._id});
            } else {
                res.status(400).json({ message: 'login was unsuccessful' });
            }
        }
    } catch (error) {
        res.status(400).json({
            message: "Error occured",
            error: error.message,
        });
        
    }
}

// i can register a user and authenticate if the user is in the db
// now I need to work on the role of the user
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
                    res.status(201).json({
                        message: 'userrole updated successfully',
                    });
                } else {
                    res.status(400).json({ message: 'The user is already an admin' })
                }
            } catch(e) {
                res.status(400).json({ message: 'ERROR OCCURED', error: e.message })
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

const deleteSpecificUser = async (req, res) => {
    const { id } = req.body;
    const user = await User.findByIdAndDelete(id);
    res.json({ message: "deleted",
        user
    })
}

module.exports = { register, login, userRole, deleteSpecificUser }