const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const userReg = mongoose.Schema({
    name:{
        type:String,
        required: true
    },
    email:{
        type:String,
        required:true
    },
    password:{
        type:String,
        required:true
    },
    gender:{
        type:String,
    },
    isAdmin:{
        type:Boolean,
        default:false,
    },
    Date:{
        type:Date,
        default:Date.now()
    },
    tokens:[{
        token: {
            type:String,
            required:true
        }
    }]
})

userReg.pre('save', async function(next){
    if(this.isModified('password')){
        this.password = await bcrypt.hash(this.password, 12)
    }
    next();
})

userReg.methods.generateAuthToken = async function(){
    try{
        let token = jwt.sign({_id:this._id}, process.env.TOKEN_SECRET_KEY);
        this.tokens = this.tokens.concat({token:token})
        await this.save();
        return token;
    }
    catch(err){
        console.log(err)
    }
}

const Accounts = new mongoose.model('Accounts', userReg)
module.exports = Accounts;