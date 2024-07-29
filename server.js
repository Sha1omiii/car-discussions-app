const mongoose = require('mongoose');
const dotenv = require('dotenv').config();
const session = require('express-session');
const express = require('express');
const app = express();
const carBlogRouter = require('./routes/carBlogs.js');
const Postmodel = require('./model/postmodel.js');
const methodOverride = require('method-override');
const cookieParser = require('cookie-parser');
const { authenticateAdmin, authenticateUser } = require('./middleware/auth.js');


const PORT = process.env.PORT || 8000;

mongoose.connect(process.env.MAINAPP_URI);
mongoose.connection.on('connected', () => {
    console.log(`connected to ${mongoose.connection.name}`);
})

//upload images

// I need to create an express function that takes the user date and puts it into the database
// we will take the user data from the body using express middleware
app.use(methodOverride('_method'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use('/uploads', express.static('uploads'));

app.use(session({
    secret: process.env.SECRET_TOKEN,
    resave: false,
    saveUninitialized: false,
    cookie: { secure: false }
}));

app.set('view engine', 'ejs');


app.use('/api/auth', require('./auth/route.js'));

app.get('/login', (req, res) => {
    res.render('login');
});

app.get('/register', (req, res) => {
    res.render('register-form');
});

app.get('/', authenticateUser, async (req, res) => {
    const discussions = await Postmodel.find().sort({ writtenAt: 'desc' }).populate('owner');
    res.render('index.ejs', {discussions: discussions, user: req.session.user });
});

app.use('/carblogs', authenticateUser, carBlogRouter);

app.get('/carblogs/new', authenticateUser, (req, res) => {
    res.render('carblog/new', { post: new Postmodel(), user: req.session.user });
});

app.get('/admin', authenticateAdmin, (req, res) => {
    res.render('admin', { user: req.user });
});

app.get('/basic', authenticateUser, async (req, res) => {
    const discussions = await Postmodel.find().sort({ writtenAt: 'desc' }).populate('owner');
    res.render('index', { discussions: discussions, user: req.session.user });
})

app.get('/logout', (req, res) => {
    req.session.destroy(e => {
        if (e) {
            return res.json({ message: 'Failed to log you out'})
        }
        res.redirect('/');
    });
});


app.listen(PORT, () => {
    console.log(`Listening on port ${PORT}`);
});