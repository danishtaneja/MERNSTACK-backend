require('dotenv').config();
const express = require('express');
const app = express();
const port = 5000 || process.env.PORT
const cookieParser = require('cookie-parser')
require('./db/conn');
app.use(express.json());
app.use(cookieParser());
app.use(require('./routes/routes'));


app.listen(port,console.log(`Server is Listening to ${port}`))