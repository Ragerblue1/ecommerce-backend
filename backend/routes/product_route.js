require('dotenv').config();
const Category = require('../models/Category.js');
const Product = require('../models/products.js')
const express = require('express')
const router = express.Router()
const app = express();
app.use(express.json())
const mongoose = require('mongoose')
const CheckValidId = require('../middleware/ValidId.js')

//Adding Products
router.post(`/`, async (req, res) => {

    const { name, image, price, countInStock, description, richDescrption, brand, category, rating, numReviews, isFeatured } = req.body;
    if (!name || countInStock === undefined || countInStock === null || isNaN(price) || price === null || price === undefined || price < 0) {
        return res.status(400).json({
            success: false,
            message: "Name ,price and CountInStock are required"
        });
    }

    try {
        console.log("Raw Category from body:", `|${category}|`); 

    if (!category) {
        return res.status(400).json({ success: false, message: "Category ID is missing" });
    }
        const FindCategory = await Category.findById(category.trim())
        if (!FindCategory) {
            return res.status(400).json({
                success: false,
                message: "Inavlid Category"
            });
        }
        const product = new Product({
            name,
            image,
            price,
            countInStock,
            description, richDescrption, brand, category, rating, numReviews, isFeatured
        });

        const createdProduct = await product.save();
        res.status(201).json({
            success: true,
            data: createdProduct
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

//getting Products

router.get('/', async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const PageSize = 100;

        const totalProducs = await Product.countDocuments({ countInStock: { $gt: 0 } })

        const ProductList = await Product.find({ countInStock: { $gt: 0 } })
            .select('name price description image _id')
            .populate('category', 'name')
            .limit(100)
            .skip(PageSize * (page - 1));
        ;

        if (ProductList.length === 0) {
            return res.status(404).json({
                success: false,
                message: "No Prodcuts Found"

            });
        }
        res.status(200).json({
            success: true,
            count: ProductList.length,
            totalCount: totalProducs,
            currentpage: page,
            data: ProductList
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
})

//getting particular Product
router.get('/:id', CheckValidId, async (req, res) => {
    const { id } = req.params;
    try {
        const product = await Product.findById(id).populate('category', 'name');
        if (!product) {
            return res.status(404).json({ success: false, message: "Product Does not Exist" })
        }
        res.status(200).json({ success: true, data: product })
    } catch (error) {
        return res.status(500).json({ success: false, message: "Server Error:-" + error.message })
    }
})

//getting feature Products
router.get('/get/featured', async (req, res) => {
    try {
        const product = await Product.find({ isFeatured: true });
        if (!product) {
            return res.status(404).json({ success: false, message: "Product Does not Exist For Featuring" })
        }
        res.status(200).json({ success: true, data: product })
    } catch (error) {
        return res.status(500).json({ success: false, message: "Server Error:-" + error.message })
    }
})



//deletion of Products
router.delete('/:id', CheckValidId, async (req, res) => {
    const { id } = req.params;
    try {
        const DeleteProduct = await Product.findByIdAndDelete(id);
        if (!DeleteProduct) {
            return res.status(404).json({ success: false, message: "Product Does not Exist" })
        }
        return res.status(200).json({ success: true, message: "Product Deleted SuccessFully" })
    } catch (error) {
        return res.status(500).json({ success: false, message: "Server Error:-" + error.message })
    }
})

//updation of Products
router.patch('/:id', CheckValidId, async (req, res) => {
    const { id } = req.params;
    const updates = req.body
    if (updates.name && updates.name.trim() === "") {
        return res.status(400).json({ success: false, message: "Name cannot be empty" });
    }
    if (updates.price !== undefined && (isNaN(updates.price) || updates.price < 0)) {
        return res.status(400).json({ success: false, message: "Invalid price" });
    }
    try {

        if (updates.category) {
            const findCategory = await Category.findById(updates.category);
            if (!findCategory) {
                return res.status(400).json({ success: false, message: "Invalid Category ID" });
            }
        }

        const UpdatedProduct = await Product.findByIdAndUpdate(id, updates, { new: true, runValidators: true })
        if (!UpdatedProduct) {
            return res.status(404).json({ success: false, message: "Cannot not Found The Product! Nothing To Update " })
        }
        return res.status(200).json({ success: true, message: "Product Detail Updated SuccesFully", data: UpdatedProduct })
    } catch (error) {
        return res.status(500).json({ success: false, message: "Server Error:-" + error.message })
    }
})

//filter Products by name and description

router.get('/get/search', async (req, res) => {
    const { name, description, category } = req.query;
    if (!name && !description && !category) {
        return res.status(400).json({ success: false, message: "Please provide at least one search term (name, description, or category)." });
    }

    try {
        const orConditions = [];


        if (name && name.trim() !== "") {
            orConditions.push({ name: { $regex: name, $options: 'i' } });
        }
        if (description && description.trim() !== "") {
            orConditions.push({ description: { $regex: description, $options: 'i' } });
        }
        if (category && category.trim() !== "") {
            orConditions.push({ "categoryDetails.name": { $regex: category, $options: 'i' } });
        }


        if (orConditions.length === 0) {
            return res.status(400).json({ success: false, message: "No valid search terms provided" });
        }
        const ProductResults = await Product.aggregate([
            {
                $lookup: {
                    from: "categories",
                    localField: "category",
                    foreignField: "_id",
                    as: "categoryDetails"
                }
            },
            {
                $unwind: { path: "$categoryDetails", preserveNullAndEmptyArrays: true }
            }
            ,
            {
                $match: {

                    $or:orConditions
                }
            },
            {
                $sort: { name: 1 }
            },
            {
                $project: {
                    name: 1,
                    description: 1,
                    price: 1,
                    image: 1,
                    "categoryDetails": 1,
                    countInStock: 1
                }
            }

        ])

        if (!ProductResults || ProductResults.length === 0) {
            return res.status(404).json({ success: false, message: "NO Products Found With This Name And Description" })
        }
        return res.status(200).json({ success: true, message: "Products Found", data: ProductResults })
    } catch (error) {
        return res.status(500).json({ success: false, message: "SERVER ERROR:-" + error.message })
    }
})

module.exports = router;
