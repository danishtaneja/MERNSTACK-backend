const mongoose = require('mongoose');

const newProduct = mongoose.Schema({
        name: {type:String, required:true},
        category: {type:String, required:true},
        image: {type:String, required:true},
        price: {type:Number, required:true},
        count: {type:Number, required:true},
        brand: {type:String, required:true},
        gender: {type:String, required:true},
        rating: {type:Number, required:false},
        numReviews: {type:Number, required:false},
        description: {type:String, required:true}
})

const product = new mongoose.model('product', newProduct)

module.exports = product;