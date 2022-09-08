const jwt = require('jsonwebtoken');
const Accounts = require('../models/userRegistration');

const Authencticate = async (req, res, next)=>{
    try{
        const token = req.cookies.jwt;
        const verify = jwt.verify(token, process.env.TOKEN_SECRET_KEY)

        const authUser = await Accounts.findOne({_id:verify._id, "tokens:token":token});
        if(!authUser) {throw new Error('User Not Found...')};

        req.token = token;
        req.authUser = authUser;
        req.userID = authUser._id;
        
        next();
    }
    catch(err){
        res.status(401).send('Unauthorized User...')
        console.log(err)
    }
}

module.exports = Authencticate;