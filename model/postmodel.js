const mongoose = require('mongoose')
const slugify = require('slugify');

const commentSchema = new mongoose.Schema({
    user: String,
    message: String,
    createdAt: { 
        type: Date, 
        default: Date.now 
    }
});

const carBlogSchema = new mongoose.Schema({
    title: String,
    make: String,
    writtenAt: Date,
    description: String,
    img: {
        type: String,
        required: false
    },
    slug: {
        type: String, 
        unique: true,
        required: true,
    },
    comments: [commentSchema],
    owner: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true }
});

carBlogSchema.pre('validate', function (next) {
    if (this.title) {
        this.slug = slugify(this.title, {lower: true, strict: true});
    }

    next();
});

module.exports = mongoose.model('Postmodel', carBlogSchema);