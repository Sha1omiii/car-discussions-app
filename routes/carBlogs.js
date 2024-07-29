// this file holds my routes for my main app
const express = require('express');
const router = express.Router();
const Postmodel = require('../model/postmodel');
const { authenticateUser } = require('../middleware/auth');
const multer = require('multer');
const path = require('path');


const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'uploads/'); 
    },

    filename: (req, file, cb) => {
        cb(null, Date.now() + path.extname(file.originalname)); 
    }
});

const upload = multer({ 
    storage: storage,
    limits: {fileSize: 10 * 1024 * 1024}    
});


router.get('/new', (req, res) => {
    res.render('carblog/new.ejs', { post: new Postmodel(), user: req.user });
});

router.get('/edit/:id', async(req, res) => {
    try {
        const discussion = await Postmodel.findById(req.params.id);
        if (!discussion) {
            console.log('discussion not discovered');
            return res.status(404).send('discussion not discovered')
        }
        res.render('carblog/edit.ejs', { discussion: discussion, user: req.user });
    } catch (e) {
        console.log(e);
        res.status(500).send('Server Error')
    } 
});

// instead of having the whole id in the url,
// slug makes it easier to use parts of the title as a path on the url name
router.get('/:slug', async (req, res) => {
    try {
        const carBlog = await Postmodel.findOne({ slug: req.params.slug }).populate('owner').exec();
        if (carBlog == null) {
            res.redirect('/');
        }
        res.render('carblog/show.ejs', { post: carBlog, user: req.user });
    } catch (e) {
        console.log(e);
        res.json({ messgae: 'Server-side Error' });
    }  
});

router.post('/', authenticateUser, upload.single('img'), async (req, res) => {
    console.log(req.file);
    if (!req.user) {
        console.log('User not authenticated');
        return res.status(403).send('User not authenticated');
    }

    let reqCarBlog = new Postmodel({
        title: req.body.title,
        make: req.body.make,
        writtenAt: new Date(),
        img: req.file ? `/uploads/${req.file.filename}` : undefined, // Ensure this is set correctly
        description: req.body.description,
        owner: req.user._id,
    });


    //
    try {
        reqCarBlog = await reqCarBlog.save();
        res.redirect(`/carblogs/${reqCarBlog.slug}`);
    } catch (e) {
        console.log(e);
        res.render('carblog/new.ejs', { error: 'Failed to save post' });
    }
});

router.post('/:slug/comments', async (req, res) => {
    try {
        const post = await Postmodel.findOne({ slug: req.params.slug });
        if (!post) {
            console.log('No post found')
            return res.redirect('/');
        }
        post.comments.push({
            user: req.body.user,
            message: req.body.message
        });
        await post.save();
        console.log('successfully added comment: ', post.comments);
        res.redirect(`/carblogs/${req.params.slug}`);
    } catch (e) {
        console.log(e);
        res.status(500).json({ message: 'Error on the server side' });
    }
});

router.put('/:id', authenticateUser, upload.single('img'), async (req, res) => {
    try {
        const post = await Postmodel.findById(req.params.id);
        if (!post) {
            return res.status(404).send('Post not found');
        }

        if (post.owner.toString() !== req.user._id.toString()) {
            return res.status(403).send('You do not have permission to edit this post');
        }
        post.title = req.body.title;
        post.make = req.body.make;
        post.description = req.body.description;
        if (req.file) {
            post.img = `/uploads/${req.file.filename}`;
        }

        await post.save();
        res.redirect(`/carblogs/${post.slug}`);
    } catch (e) {
        console.error(e);
    }
});

router.delete('/:id', authenticateUser, async (req, res) => {
    try {
        const post = await Postmodel.findById(req.params.id);
        if(!post) {
            return res.status(404).send('No Post Found.');
        }

        if (post.owner.toString() !== req.user._id.toString()) {
            res.status(403).send('You dont have the permission to delete this post.')
        }

        await post.deleteOne();
        res.redirect('/');
    } catch (e) {
        console.log(e);
        res.send('Server side error.');
    }
});


module.exports = router;