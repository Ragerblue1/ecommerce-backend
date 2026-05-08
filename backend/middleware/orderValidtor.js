const { isValidObjectId } = require("mongoose");
const OrderItems=require('../models/orderItem.js');
const products = require("../models/products");
const mongoose=require('mongoose')
const ValidOrder=(req,res,next)=>{

    const validatorOfOrder={
    user: (val) => val && mongoose.isValidObjectId(val),
    totalPrice: (val) => typeof val === 'number' && val >= 0,
    shippingAddress2: (val) => true,
    phone:(val)=>/^\d{10}$/.test(val),
    zipCode:(val)=>val && val.toString().length === 6,
    country:(val)=>val && val.trim().length>0,
    shippingAddress1:(val)=>val && val.trim().length>0,
    status:(val)=>val === undefined || (typeof val === 'string' && val.trim().length > 0),
    city:(val)=>val && val.trim().length>0,
orderItems: (val) => Array.isArray(val) && val.length > 0 && val.every(item => 
    item.quantity > 0 && mongoose.isValidObjectId(item.product)
),
    dateOrder:(val)=>true
}

const Data={}
for (const field in validatorOfOrder){
    const value=req.body[field];
    const isValid=validatorOfOrder[field](value)
    if(!isValid){
        return res.status(400).json({ 
                success: false, 
                message: `Invalid or missing field: ${field}` 
            });
    }
    Data[field]=req.body[field];
}
req.DataToPost=Data
next();
}

module.exports=ValidOrder