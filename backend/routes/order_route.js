const Order = require('../models/orders.js')
const express = require('express')
const Users = require('../models/users.js')
const ValidOrder = require('../middleware/orderValidtor.js')
const { default: mongoose } = require('mongoose')
const OrderItem = require('../models/orderItem.js')
const CheckValidId = require('../middleware/ValidId.js')
const { populate } = require('dotenv')
const Product = require('../models/products.js')
const router = express.Router()

//getting orderlist
router.get('/', async (req, res) => {
    try {
        const OrderList = await Order.find().populate("user", "name email").sort("dateOrdered")
        if (!OrderList) {
            return res.status(404).json({ success: false, messsage: "Orders Not Found " })
        }
        return res.status(200).json({ success: true, data: OrderList })
    } catch (error) {
        return res.status(500).json({ success: false, messsage: "Orders Not Found " })
    }
})

//post of orders
// not able tpo fully understand thsi route  i will understand it using a flow diagram 
router.post('/', ValidOrder, async (req, res) => {
    try {
        const userExist = await Users.findById(req.DataToPost.user);
        if (!userExist) {
            return res.status(404).json({ success: false, message: "Enter Valid User Id ! User Not Found" })
        }

        const orderItemsIds = await Promise.all(req.body.orderItems.map(async (items) => {
            const fetchedProduct = await Product.findById(items.product);
            const itemTotalPrice = fetchedProduct.price * items.quantity;

            let newOrderItem = new OrderItem({
                quantity: items.quantity,
                product: items.product
            })
            const SavednewOrderItem = await newOrderItem.save();
            return {
                orderItemsId: SavednewOrderItem._id,
                calculatedPrice: itemTotalPrice
            }
        }))
        const finalItemId = orderItemsIds.map((item) => {
            return item.orderItemsId;
        })

        const finalTotalPrice = orderItemsIds.reduce((acc, item) => acc + item.calculatedPrice, 0);


        const orderData = {
            ...req.DataToPost,
            orderItems: finalItemId,
            totalPrice: finalTotalPrice
        }

        const newOrder = new Order(orderData)
        const saveOrder = await newOrder.save()
        return res.status(201).json({ success: true, message: "Order created SuccesFully", data: saveOrder })
    } catch (error) {
        return res.status(500).json({ success: false, message: "Server Error " + error.message })
    }
})


//getting order by id
router.get('/:id', async (req, res) => {
    const { id } = req.params;
    try {
        const orderById = await Order.findById(id).populate("user", "name email")
            .populate({ path: "orderItems", populate: 'product' })
        // .populate({path:"product",populate:"category"})
        if (!orderById) {
            return res.status(404).json({ success: false, messsage: "Order Not Found " })
        }
        return res.status(200).json({ success: true, data: orderById })
    } catch (error) {
        return res.status(500).json({ success: false, messsage: "Sever Error:-" + error.message })
    }
})

//updating status 
router.patch('/:id', async (req, res) => {
    const { id } = req.params;
    try {
        const OrderToUpdate = await Order.findByIdAndUpdate(id, {
            status: req.body.status
        }, {
            new: true
        });
        if (!OrderToUpdate) {
            return res.status(404).json({ success: false, messsage: "Order Not Found Cannot be Updated " })
        }
        return res.status(200).json({ success: true, data: OrderToUpdate })
    } catch (error) {
        return res.status(500).json({ success: false, messsage: "Sever Error:- " + error.message })
    }

})

//deleting order by id
router.delete('/:id', async (req, res) => {
    const { id } = req.params;
    try {
        const OrderToDelete = await Order.findByIdAndDelete(id);
        if (!OrderToDelete) {
            return res.status(404).json({ success: false, messsage: "Order Not Found Cannot be Deleted " })
        }
        return res.status(200).json({ success: true, message: "Order Deleted SuccessFully" })
    } catch (error) {
        return res.status(500).json({ success: false, messsage: "Sever Error:- " + error.message })
    }

})

//getting totalsales for admin
router.get('/get/totalsales', async (req, res) => {
    try {
        const totalSales = await Order.aggregate([
            { $group: { _id: null, totalsales: { $sum: '$totalPrice' } } }
        ]
        )
        if (!totalSales || totalSales.length === 0) {
            return res.status(400).json({ success: false, messsage: "Orders Sales cannot be Generated" })
        }
        return res.status(200).json({ success: true, data: { totalsales: totalSales[0].totalsales } })
    } catch (error) {
        return res.status(500).json({ success: false, messsage: "Sever Error:- " + error.message })
    }
})

// getting total count for the aadmin
router.get('/get/count', async (req, res) => {
    try {
        const OrderCount = await Order.countDocuments()
        return res.status(200).json({ success: true, data: { totalOrderCount: OrderCount } })
    } catch (error) {
        return res.status(500).json({ success: false, messsage: "Sever Error:- " + error.message })
    }
})

router.get('/get/userorders/:userid', async (req, res) => {
    const { userid } = req.params;
    try {
        const userOrderList = await Order.find({user:userid}).populate({
            path: "orderItems", populate: {
                path: "product", populate: "category"
            }
        }).sort({ "dateOrdered": -1 })
        if (userOrderList.length===0) {
            return res.status(200).json({ success: true, messsage: "You have zero Orders" })
        }

        const userOrdersCount=userOrderList.length;
        
        return res.status(200).json({ success: true, data: {AlluserOrderlist:userOrderList,TotalUserOrdersCount:userOrdersCount} })
    } catch (error) {
        return res.status(500).json({ success: false, messsage: "Orders Not Found " })
    }
})
module.exports = router