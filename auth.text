const mongoose = require('mongoose');
const User = require('./model/user');
const connectToDB = require('./database');
const dotenv = require('dotenv').config();
const express = require('express');
const app = express();
const PORT = process.env.PORT ? process.env.PORT : '8000'
// so to protect unauthenticated users from getting access to admin rountes
// I have to look at the token and depending on the user role, I redirect them based 
// their role
const cookieParser = require('cookie-parser');
const { authenticateAdmin, authenticateUser } = require("./middleware/auth");

connectToDB();

// I need to create an express function that takes the user date and puts it into the database
// we will take the user data from the body using express middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
// now I need to import my router file as a middleware
app.use('/api/auth', require('./auth/route'));

app.set('view engine', 'ejs');

app.get('/', (req, res) => {
    res.render('landing');
});

app.get('/register', (req, res) => {
    res.render('register-form');
});

app.get('/login', (req, res) => {
    res.render('login');
});

app.get('/admin', authenticateAdmin, (req, res) => {
    res.send('Welcome to the Admins page');
    res.render('admin');
})

app.get('/basic', authenticateUser, (req, res) => {
    res.render('user', {
        user: req.user,
    });
});

app.get('/logout', (req, res) => {
    res.cookie('jwt', '', { maxAge: '1' });
    res.redirect('/');
})

app.listen(PORT, () => {
    console.log(`Listenting on ${PORT}`);
});