// this auth job is only to look at the token (it requests the token) 
// and grand access after verifying the token ( and also checking if token is available)
const jwt = require('jsonwebtoken');
const dotenv = require('dotenv').config();
const User = require('../model/user');

const authenticateAdmin = (req, res, next) => {
    const token = req.cookies.jwt;
    if (!token) {
        return res.redirect('/login');
    }

    
    jwt.verify(token, process.env.SECRET_TOKEN, (e, decodedToken) => {
        if (e) {
            console.log('Token verification error: ', e);
            return res.redirect('/login');
        } 
        if ( decodedToken.role !== 'admin' ) {
                console.log('decodedToken: ', decodedToken);
                return res.status(403).json({ message: 'Access denied' });
        }
        req.user = decodedToken;
        next();

    });
} 

const authenticateUser = (req, res, next) => {
    const token = req.cookies.jwt;
    if (token) {
        jwt.verify(token, process.env.SECRET_TOKEN, async (e, decodedToken) => {
            if (e) {
                res.redirect('/login');
            } else {
                let user = await User.findById(decodedToken.id);
                req.user = user;
                next();
            }
        });
    } else {
        res.redirect('/login');
    }

    // if (!token) {
    //     return res.redirect('/login');
    // }
    // jwt.verify(token, process.env.SECRET_TOKEN, (e, decodedToken) => {
    //     if (e) {
    //         console.log('Token verify error: ', e);
    //         return res.redirect('/login');
    //     } 
    //     req.user = decodedToken;
    //     next();
    // });
}

module.exports = { authenticateAdmin, authenticateUser }