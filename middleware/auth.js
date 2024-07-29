// this auth job is only to look at the token (it requests the token) 
// and grand access after verifying the token ( and also checking if token is available)
const jwt = require('jsonwebtoken');
const dotenv = require('dotenv').config();
const User = require('../model/user');

const authenticateUser = (req, res, next) => {
    if (req.session.user) {
        req.user = req.session.user;
        return next();
    }
    res.redirect('/login');
} 

const authenticateAdmin = (req, res, next) => {
    if (req.session.user && req.session.user.role === 'admin') {
        return next();
    }

    if (req.headers.accept && req.headers.accept.includes('application/json')) {
        res.status(403).json({ message: 'Access Denied '});
    }
    res.status(403).json({ message: 'Access Denie' });
}

module.exports = { authenticateAdmin, authenticateUser }