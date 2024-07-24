const mongoose = require('mongoose');
const connectToDB = require('./database');
const dotenv = require('dotenv').config();
const express = require('express');
const app = express();
const PORT = 8000;
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
app.use(cookieParser);
// now I need to import my router file as a middleware
app.use('/api/auth', require('./auth/route'));
app.get('/admin', authenticateAdmin, (req, res) => 
res.send('Admin\'s Route'));
app.get('/client', authenticateUser, (req, res) => 
res.send('User\'s Route'));

app.set('view engine', 'ejs');

app.listen(PORT, () => {
    console.log(`Listenting on ${PORT}`);
});