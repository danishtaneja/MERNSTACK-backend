const express = require('express');
const Accounts = require('../models/userRegistration');
const router = express.Router();
const bcrypt = require('bcryptjs');
const product = require('../models/products');
const Authencticate = require('../middleware/authentication');
// const Review = require('../models/Reviews');
const PlaceOrder = require('../models/PlaceOrder');
const Help = require('../models/Help');
const nodemailer = require('nodemailer')

router.get('/', async(req,res)=>{
    res.send('Hello from Backend..')
})

router.get('/product', async(req,res)=>{
    const data = await product.find();
    res.status(200).json(data);
})

router.get('/product/:id', async(req,res)=>{  
    const p_data = await product.findById(req.params.id);
    if(p_data){
        res.status(200).json(p_data)  
    }
    else{
        res.status(400).json({err:'Product not found...'})
    }
})

router.post('/signup', async(req,res)=>{

const {name, email, gender, password, confirm_password} = req.body;

if(name==='' || email ==='' || gender==='' || password ==='' || confirm_password === ''){
    res.json({err:'Please fillup the form...'})
}

try{
    if (password === confirm_password){
        const Details = new Accounts({
            name:name,
            email:email,
            gender:gender,
            password:password
        })
    const findEmail = await Accounts.findOne({email:email})  
    if(findEmail){
        res.json({msg:'USER Exists...'})
    }
    else{
    await Details.save();  
        res.json({msg:'Registered Successfully...'})
    }
}
}
catch(err){
    res.json({err:err})
}

})

router.post('/sign-in', async(req, res)=>{
    const {email, password} = req.body;
    if(email=== '' || password ==''){
      return  res.status(400).json({err:'Please fill the form properly...'})
    }
        const findUser = await Accounts.findOne({email:email});
        const role = await findUser.isAdmin;
        // console.log(role)
        if(findUser){
            const isMatch = await bcrypt.compare(password, findUser.password)
            const token = await findUser.generateAuthToken();
           res.cookie('jwt', token, {
            expire: new Date(Date.now + 300000),
            httpOnly:true,
           })
            if(!isMatch){
                res.status(401).json({err:'Invalid Credentials...'})
            }
            else if(isMatch){
                if(role === true){
                res.status(200).json({msg:'welcome Admin'})
                }
                else{
                    res.status(201).json({msg:'welcome Client'})
                }
            }
            else{
                res.status(200).json({msg:'Welcome'})
            }
        }
        else{
            res.status(401).json({err:'Invalid User...'})
        }
})


router.get('/profile', Authencticate, async(req, res)=>{
    res.send(req.authUser)
})
router.get('/authUSER', Authencticate, async(req, res)=>{
    res.send(req.authUser)
})

router.get('/logout', async(req,res)=>{
    res.clearCookie('jwt', {path:'/'});
    res.status(200).send('User Logout...');
})

router.get('/addproduct', Authencticate, async(req, res)=>{
    const userAuth = await req.authUser.isAdmin;
    if(userAuth === true){
        res.status(200).json({msg:'Authenticated User...'})
        res.send(req.authUser)
    }
    else{
        res.status(400).json({err:'ERROR AUTHENTICATION...'})
    }
})

router.post('/addproduct', Authencticate,async(req,res)=>{

    const userAuth = req.authUser.isAdmin;
    if(userAuth===true){
        const {name, category, image, price, count, brand, gender, description} = req.body;
        if(!name || !category || !image ||  !price || !count || !brand || !gender || !description ){
            res.status(401).json({err:'Please fill up the details....'})
        }
        try{
            const ProductDetails = await product({
                name:name,
                category:category,
                image:image,
                price:price,
                count:count,
                brand:brand,
                gender:gender,
                rating:3.5,
                numReviews:6,
                description:description
            })
            const result = await ProductDetails.save();
            // console.log(ProductDetails)

            if(result){
                res.status(200).json({msg:'Product Addedd Successfully..'})
            }
            else{
                res.status(400).json({err:err})
            }
        }
        catch(err){
            console.log(err)
        }
    }       
    else{
        res.status(400).json({err:'Authentication Error...'})
    }
})


// router.post('/review' , async(req,res)=>{
//     const Details = await Review({
//         // name:req.authUser.name,
//         product:req.body.product,
//         star:req.body.star,
//         content:req.body.content
//     })
//     console.log(Details)
// })


router.post('/place-order', async(req,res)=>{

    const { name, email, phone, Address, Country, zip, price, Items, products, status } = req.body;
        // comments } = req.body;
    if( name==='', email==='', phone==='', Address==='', Country==='', zip==='', price==='', Items==='', products===[], status==='')
    //  || comments==='')
    {
        res.send('Please Enter the valid details...')
    }
    try{
            const Details = new PlaceOrder({
                name:name,
                email:email,
                phone:phone,
                Address:Address,
                Country:Country,
                zip:zip,
                price:price,
                Items:Items,
                products:products,
                status:status,
                // comments:comments
            })

            const result = await Details.save();

            let transporter = nodemailer.createTransport({
                service:'gmail',
                auth:{
                    user:"danishtaneja200@gmail.com",
                    pass:"diuwqtfgdwqgloqz"
                },
                tls:{
                    rejectUnauthorized:false,
                },
            });
            
                let options = {
                    from:"danishtaneja200@gmail.com",
                    to:result.email,
                    subject:'Thank you for Shopping..',
                    text:`Hi ${result.name},


                        Thank you for Shopping with fashion Shop.
                        Your Order Details is Shown below:
                        
                        Name: ${result.name}
                        Email: ${result.email}
                        Phone: ${result.phone}
                        Address: ${result.Address} ${result.Country}
                        Zip: ${result.zip}
                        Total Items: ${result.Items}
                        Total Price: $${result.price}
                        Products Id's: ${result.products[0]}
                        Thank you 
                        Fashion Shop`,
                }
            
                transporter.sendMail(options, function(err, info){
                    if(err){
                        console.log(err);
                    }
                })

            // transporter.sendMail(options).then(function(res){
            //     console.log('Email Send', res);
            // })
            // .catch(function(err){
            //     console.error(err);
            // })


            // console.log(Details)
            res.json({msg:"ORDER PLACED...."})
    }
    catch(err){
        res.json({err:err})
    }
})


router.get('/my-orders', Authencticate,async(req,res)=>{
    const authCheck = req.authUser.isAdmin;
    if(authCheck === true){
        const myorder = await PlaceOrder.find()
        res.status(200).send(myorder)   
    }
    else if(authCheck===false){
        // const cust_order = await PlaceOrder.find({$and:[{name:req.authUser.name}, {email:req.authUser.email}]})
        const cust_order = await PlaceOrder.find({$or:[{name:req.authUser.name}, {email:req.authUser.email}]})
        res.status(200).send(cust_order)
    }
    else{
        console.log(err)
    }
})

router.get('/app_orders', Authencticate, async(req,res)=>{
    const authCheck = req.authUser.isAdmin;
    if(authCheck === true){
        const myorder = await PlaceOrder.find({status:'Approved'})
        res.status(200).send(myorder)   
    }
    else if(authCheck===false){
        // const cust_order = await PlaceOrder.find({$and:[{name:req.authUser.name}, {email:req.authUser.email}]})
        const cust_order = await PlaceOrder.find({$and:[{$or:[{name:req.authUser.name}, {email:req.authUser.email}]}, {status:'Approved'}]})
        res.status(200).send(cust_order)
    }
    else{
        console.log(err)
    }
})

router.get('/new_orders', Authencticate, async(req,res)=>{
    const authCheck = req.authUser.isAdmin;
    if(authCheck === true){
        const myorder = await PlaceOrder.find({status:'Pending'})
        res.status(200).send(myorder)   
    }
    else if(authCheck===false){
        // const cust_order = await PlaceOrder.find({$and:[{name:req.authUser.name}, {email:req.authUser.email}]})
        const cust_order = await PlaceOrder.find({$and:[{$or:[{name:req.authUser.name}, {email:req.authUser.email}]}, {status:'Pending'}]})
        res.status(200).send(cust_order)
    }
    else{
        console.log(err)
    }
})

router.get('/cancel_orders', Authencticate, async(req,res)=>{
    const authCheck = req.authUser.isAdmin;
    if(authCheck === true){
        const myorder = await PlaceOrder.find({status:'Cancel'})
        res.status(200).send(myorder)   
    }
    else if(authCheck===false){
        // const cust_order = await PlaceOrder.find({$and:[{name:req.authUser.name}, {email:req.authUser.email}]})
        const cust_order = await PlaceOrder.find({$and:[{$or:[{name:req.authUser.name}, {email:req.authUser.email}]}, {status:'Cancel'}]})
        res.status(200).send(cust_order)
    }
    else{
        console.log(err)
    }
})

router.get('/refund_orders', Authencticate, async(req,res)=>{
    const authCheck = req.authUser.isAdmin;
    if(authCheck === true){
        const myorder = await PlaceOrder.find({status:'Refund'})
        res.status(200).send(myorder)   
    }
    else if(authCheck===false){
        // const cust_order = await PlaceOrder.find({$and:[{name:req.authUser.name}, {email:req.authUser.email}]})
        const cust_order = await PlaceOrder.find({$and:[{$or:[{name:req.authUser.name}, {email:req.authUser.email}]}, {status:'Refund'}]})
        res.status(200).send(cust_order)
    }
    else{
        console.log(err)
    }
})



router.get('/my-order', Authencticate, async(req,res)=>{
    const authCheck = req.authUser.isAdmin;
    if(authCheck === true){
        const ApprovedOrders = await PlaceOrder.find({status:'Approved'}).count();
        const NewOrders = await PlaceOrder.find({status:'Pending'}).count();
        const CancelOrders = await PlaceOrder.find({status:'Cancel'}).count();
        const RefundOrders = await PlaceOrder.find({status:'Refund'}).count();
        const NewUSER = await Accounts.find({isAdmin:'false'}).count();
        res.status(200).send([ApprovedOrders, NewOrders, CancelOrders, RefundOrders, NewUSER])   
    }
    else if(authCheck===false){
        const ApprovedOrders = await PlaceOrder.find({$and:[{name:req.authUser.name}, {email:req.authUser.email}, {status:'Approved'}]}).count();
        const NewOrders = await PlaceOrder.find({$and:[{name:req.authUser.name}, {email:req.authUser.email}, {status:'Pending'}]}).count();
        const CancelOrders = await PlaceOrder.find({$and:[{name:req.authUser.name}, {email:req.authUser.email}, {status:'Cancel'}]}).count();
        const RefundOrders = await PlaceOrder.find({$and:[{name:req.authUser.name}, {email:req.authUser.email}, {status:'Refund'}]}).count();
        res.status(200).send([ApprovedOrders, NewOrders, CancelOrders, RefundOrders])   
    }
    else{
        console.log(err)
    }
})

router.get('/category', Authencticate,async(req,res)=>{
   const authCheck = req.authUser.isAdmin;
    if(authCheck === true){
    const T_shirt = await product.find({category:'T-shirt'}).count();
    const Jacket= await product.find({category:'Jacket'}).count();
    const Pants = await product.find({category:'Pants'}).count();
    const Jeans = await product.find({category:'Jeans'}).count();
    const Shoes = await product.find({category:'Shoes'}).count();
    const Trouser = await product.find({category:'Trouser'}).count();
    const Hoodie = await product.find({category:'Hoodie'}).count();
    const Others = await product.find({category:'Others'}).count();
    res.status(200).json([T_shirt, Jacket, Pants, Jeans, Shoes, Trouser, Hoodie, Others])
    }
    else{
        res.json({err:'Errorr..'})
    }
})
router.get('/new-users', Authencticate,async(req,res)=>{
    const authCheck = req.authUser.isAdmin;
     if(authCheck === true){
        const new_users = await Accounts.find({isAdmin:false})
     res.status(200).json(new_users)
     }
     else{
         res.json({err:'Errorr..'})
     }
 })

router.get('/edit/:id', Authencticate,async(req,res)=>{  
    const authCheck = req.authUser.isAdmin;
    if(authCheck === true){
    const p_data = await PlaceOrder.findById(req.params.id);
    if(p_data){
        res.status(200).json(p_data)  
    }
    else{
        res.status(400).json({err:'Order not found...'})
    }
}else{
    res.status(400).json({err:'Error...'});
}
})

router.get('/delete/:id', Authencticate,async(req,res)=>{  
    const authCheck = req.authUser.isAdmin;
    if(authCheck === true){
        const p_data = await product.findByIdAndDelete(req.params.id);
    if(p_data){
        res.status(200).json(p_data)  
    }
    else{
        res.status(400).json({err:'Product not found...'    })
    }
    }else{
        res.status(400).json({err:'Error...'});
    }
})

router.get('/eprod/:id', Authencticate,async(req,res)=>{
    const authCheck = req.authUser.isAdmin;
    if(authCheck === true){
    const p_data = await product.findById(req.params.id);
    if(p_data){
        res.status(200).json(p_data)  
    }
    else{
        res.status(400).json({err:'Product not found...'})
    }
}else{
    res.status(400).json({err:'Error...'});
}
})

router.post('/eprod/:id', Authencticate,async(req,res)=>{
    const authCheck = req.authUser.isAdmin;
    if(authCheck === true){
        const odrerID = req.params.id
const updateOrders = await product.findByIdAndUpdate(odrerID, req.body,{new:true})
if(updateOrders){
    res.json({msg:'Updated....'})
}
else{
    res.status(400).json({err:'Error...'})
}
    }
    else{
        res.status(400).json({err:'Error...'})
    }
})
router.post('/edit/:id', Authencticate,async(req,res)=>{
    const authCheck = req.authUser.isAdmin;
    if(authCheck === true){
        const odrerID = req.params.id
const updateOrders = await PlaceOrder.findByIdAndUpdate(odrerID, req.body,{new:true})
if(updateOrders){
    res.json({msg:'Updated....'})
}
else{
    res.status(400).json({err:'Error...'})
}
    }
    else{
        res.status(400).json({err:'Error...'})
    }
})
    
router.post('/help', Authencticate,async(req,res)=>{
    const u_name = req.authUser.name;
    const u_email = req.authUser.email;
    const {name, email, purpose, message} = req.body;
    
    if(name==='' || email==='' || purpose==='' || message===''){
        res.json({err:'Please fillup the form...'})
    }
    const Details = new Help({
        name:u_name,
        email:u_email,
        purpose:purpose,
        message:message,
    })
    await Details.save();
        res.json({msg:'Request Sent...'})
})

router.post('/help-guest', async(req,res)=>{
    const {name, email, purpose, message} = req.body;
    
    if(name==='' || email==='' || purpose==='' || message===''){
        res.json({err:'Please fillup the form...'})
    }
    const Details = new Help({
        name:name,
        email:email,
        purpose:purpose,
        message:message,
    })
    await Details.save();
        res.json({msg:'Request Sent...'})
})
    
router.get('/requests', Authencticate,async(req,res)=>{
    const authCheck = req.authUser.isAdmin;
    if(authCheck === true){
    const p_data = await Help.find();
    if(p_data){
        res.status(200).json(p_data)  
    }
    else{
        res.status(400).json({err:'Reuqest not send...'})
    }
}else{
    res.status(400).json({err:'Error...'});
}
})


// router.get('/forgot-password', async(req,res)=>{
//     const email = req.body.email;

//     const check = await Accounts.findOne({email:email})
//     if(check){
//         res.status(200).json({msg:'User Exist...'})
//     }

//     res.status(401).json({err:'Error'})
// })

// router.post('/forgot-password', async(req,res)=>{
//     const email = req.body.email;
//     const password =req.body.password;
//     const confirm_password = req.body.confirm_password;
//     if(password === confirm_password){
//         const check = await Accounts.findOneAndUpdate(email, req.body,{new:true})

//         res.status(200).json({msg:'Updated..'})
//     }
//     else{
//         res.status(400).json({err:err})
//     }
// })

module.exports = router;
