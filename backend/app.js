const express = require('express');
require('dotenv').config()
const app = express();
app.use(express.json());
const morgan = require('morgan');
const connectDB = require('./mongodb');
const cors=require('cors')
const api=process.env.API_URL


const authjwt = require('./middleware/jwtVerify.js');
const errorHandler = require('./handlers/error-handling.js');
//middlewares
app.use(morgan('dev'));
app.use(cors())
app.use(authjwt())
app.use(errorHandler)

//routes
const ProductRoutes=require('./routes/product_route.js')
const CategoryRoutes=require('./routes/category_route.js')
const UserRoutes=require('./routes/user_route.js');
const orderRoutes=require('./routes/order_route.js')
app.use(`${api}/products`,ProductRoutes);
app.use(`${api}/category`,CategoryRoutes);
app.use(`${api}/users`,UserRoutes)
app.use(`${api}/order`,orderRoutes)


connectDB()

app.listen(8080, () => {
    console.log("Server is Running at Port 8080");
})