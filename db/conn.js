const mongoose = require('mongoose');

mongoose.connect('mongodb://localhost:27017/E-commerce', {
    useUnifiedTopology:true,
    useNewUrlParser:true
})
.then(()=>console.log(`Connected to Mongodb`))
.catch((err)=>console.error(err))