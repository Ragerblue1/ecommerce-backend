const mongoose = require('mongoose')

const orderSchema = mongoose.Schema({
    orderItems: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: "OrderItem",
        required: true,
    }],
    shippingAddress1: {
        type: String,
        required: true,
    },
    shippingAddress2: {
        type: String,
    },
    status: {
        type: String,
        default: "Pending",
        required: true,
    },
    phone: {
        type: String,
        required: true
    },
    city: {
        type: String,
        required: true
    },
    country: {
        type: String,
        required: true,
    },
    zipCode: {
        type: String,
        required: true,
    },
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User"
    },
    dateOrdered: {
        type: Date,
        default: Date.now,
    },
    totalPrice: {
        type: Number
    }
}, { timestamps: true })

orderSchema.virtual('id').get(function () {
    return this._id.toHexString()
})

orderSchema.set('toJSON', {
    virtuals: true
})

// Add this right before your module.exports line
orderSchema.pre('findOneAndDelete', async function() {
    // 1. 'this' refers to the query being executed. We execute it to see WHICH order is about to be deleted.
    const orderAboutToBeDeleted = await this.model.findOne(this.getQuery());

    if (orderAboutToBeDeleted && orderAboutToBeDeleted.orderItems.length > 0) {
        // 2. We dynamically call the OrderItem model from Mongoose's internal registry
        const OrderItem = mongoose.model('OrderItem');
        
        // 3. We tell OrderItem to delete every document whose ID matches an ID in our array
        await OrderItem.deleteMany({
            _id: { $in: orderAboutToBeDeleted.orderItems }
        });
    }
    
});
module.exports = mongoose.model("Order", orderSchema)