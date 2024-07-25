const dotenv = require('dotenv').config();
const mongoose = require('mongoose');

const connectToDB = async () => {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('MongoDb Connected');
}

module.exports = connectToDB;