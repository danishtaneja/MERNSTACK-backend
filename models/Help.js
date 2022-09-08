const mongoose = require('mongoose');

const help = mongoose.Schema({
    name:{
        type:String,
        required: true
    },
    email:{
        type:String,
        required:true
    },
    purpose:{
        type:String,
        required:true
    },
    message:{
        type:String,
        required:true
    },
    Date:{
        type:Date,
        default:Date.now()
    }
})


const Help = new mongoose.model('Help', help)
module.exports = Help;