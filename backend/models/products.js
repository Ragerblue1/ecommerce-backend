const mongoose = require('mongoose')
const productsSchema = new mongoose.Schema
    ({
        name: {
            type: String,
            required: true
        },

        image: {
            type: String,
            default: '',
        },

        images: [{
            type: String
        }]
        ,
        price: {
            type: Number,
            default: 0,
            required: true,
        },

        countInStock: {
            type: Number,
            required: true,
            min: 0,
            max: 300,
        },

        description: {
            type: String,
            required: true,
        },

        richDescrption: {
            type: String,
            default: ''
        },

         brand: {
            type: String,
            default: ''
        },

         category: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Category'
        },
        
        rating: {
            type: Number,
            default: 0,
        },
        
        numReviews: {
            type: Number,
            default: 0,

        },
        isFeatured:{
            type:Boolean,
            default:false,
        },
        dateCreated:{
            type:Date,
            default:Date.now()
        }

    }
        , { timestamps: true })


module.exports = mongoose.model('Product', productsSchema)