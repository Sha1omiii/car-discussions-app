// this auth job is only to look at the token (it requests the token) 
// and grand access after verifying the token ( and also checking if token is available)
const jwt = require('jsonwebtoken');
const dotenv = require('dotenv').config();

const authenticateAdmin = (req, res, next) => {
    const token = req.cookies.jwt;
    if (token) {
        jwt.verify(token, process.env.SECRET_STRING, (e, decodedToken) => {
            if (e) {
                console.log('Token verification error: ', e);
                return res.status(401).json({ message: 'Access denied' });
            } else {
                console.log('decodedToken: ', decodedToken);
                if (decodedToken.role !== 'admin') {
                    return res.status(401).json({ message: 'Access denied' });
                } else {
                    next();
                }
            }
        });
    } else {
        return res.status(401).json({ message: 'Access denied, token unavailable.' });
    }
} 

const authenticateUser = (req, res, next) => {
    const token = req.cookies.jwt;
    if (token) {
        jwt.verify(token, process.env.SECRET_STRING, (e, decodedToken) => {
            if (e) {
                console.log('Token verify error: ', e);
                return res.status(401).json({ message: 'Access denied' });
            } else {
                if (decodedToken.role !== 'Basic') {
                    return res.status(401).json({ message: 'Access denied' });
                } else {
                    next();
                }
            }
        });
    } else {
        return res.status(401).jsonn({ message: 'Access denies, token unavailable' });
    }
}

module.exports = { authenticateAdmin, authenticateUser }