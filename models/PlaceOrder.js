const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const placeOrder = mongoose.Schema({
    name:{
        type:String,
        required: true
    },
    email:{
        type:String,
        required:true
    },
    phone:{
        type:Number,
        required:true
    },
    Address:{
        type:String,
        required:true,
    },
    Country:{
        type:String,
        required:true
    },
    zip:{
        type:Number,
        required:true
    },
    price:{
        type:Number,
        required:true
    },
    Items:{
        type:Number,
        required:true
    },
    products:[{
        type:[String],
        require:true
    }],
    status:{
        type:String,
        default:'Pending',
    },
    Comment:{type:String,},
    Date:{
        type:Date,
        default:Date.now()
    }
})

const PlaceOrder = new mongoose.model('PlaceOrder', placeOrder)
module.exports = PlaceOrder;