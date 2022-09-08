const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const Reviews = mongoose.Schema({
    name:{
        type:String,
        required: true
    },
    product:{
        type:String,
        required:true
    },
    star:{
        type:Number,
        required:true
    },
    content:{
        type:String,
        required:true
    },
    Date:{
        type:Date,
        default:Date.now()
    }
})

const Review = new mongoose.model('Review', Reviews)
module.exports = Review;