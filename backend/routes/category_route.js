require('dotenv').config();
const Category = require('../models/Category.js');
const express = require('express')
const router = express.Router()
const app = express();
const mongoose = require('mongoose')
const CheckValidId=require('../middleware/ValidId.js')
app.use(express.json())



//getting
router.get('/', async (req, res) => {

    try {
        const CategoryList = await Category.find();
        if (CategoryList === 0 || !CategoryList) {
            return res.status(200).json({ success: false, message: "0 Category Found" });
        }
        res.status(200).send(CategoryList)
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
})

//Searching Category By name
router.get('/search', async (req, res) => {
    const { name } = req.query;
    if (!name) {
        return res.status(400).json({ success: false, message: "Write Valid name " })
    }
    try {
        const Searchregex = new RegExp(name, 'i')
        if (Searchregex === undefined || Searchregex === null) {
            return res.status(400).json({ success: false, message: "Write Valid Input to Find" })
        }
        const Results = await Category.aggregate([
            {
                $match: {

                    $or: [
                        { name: { $regex: Searchregex } },
                        { description: { $regex: Searchregex } }
                    ]
                }
          
            },
            {
                $sort: {
                    name: 1
                }
            }
            , 
            {
                $project: { name: 1, _id: 1 }
            }
        ])

if (Results.length === 0) {
    return res.status(404).json({ success: false, message: "No categories found matching that name" });
}
res.status(200).json({ success: true, data: Results });
    } catch (error) {
    res.status(500).json({ success: false, message: "Search Error: " + error.message });
}

})



//get category by id
router.get('/:id',CheckValidId, async (req, res) => {
    const { id } = req.params;
        try {
            const CatagoryById = await Category.findById(id);
            if (!CatagoryById) {
                return res.status(404).json({ succes: false, message: "Category of This id Doesnot Exist Or Found" })
            }
            res.status(200).json({ success: true, message: "Category of This id is Found", data: CatagoryById });
        }
        catch (error) {
            res.status(500).json({ success: false, message: "Server Error:-" + error.message })
        }

})

//post Categories

router.post('/', async (req, res) => {
    const { name, color, icon, image } = req.body;
    if (!name || name.trim() === "") {
        return res.status(400).json({ success: false, message: "name is Required" })
    }
    try {
        const category = new Category({
            name, color, icon, image
        })
        const CreatedCategory = await category.save();
        res.status(201).json({ success: true, message: "Category Created SuccessFully", data: CreatedCategory })
    } catch (error) {
        res.status(500).json({ success: false, message: error.message })
    }
})
//deletion

router.delete('/:id', CheckValidId,async (req, res) => {
    const { id } = req.params;
    try {
        const DeletedCategory = await Category.findByIdAndDelete(id);
        if (!DeletedCategory) {
            res.status(404).json({ success: false, message: "Cannot not Found! Nothing To Delete " })
        }
        res.status(200).json({ success: true, message: "Category Deleted SuccessFully" })
    }
    catch (error) {
        res.status(500).json({ success: false, message: error.message })
    }
})



//Updation

router.patch('/:id',CheckValidId,async (req, res) => {
    const { id } = req.params;
    try {
        const UpdatedDetails = req.body
        const UpdatedCatgeory = await Category.findByIdAndUpdate(id, UpdatedDetails, { new: true });
        if (!UpdatedCatgeory) {
            res.status(404).json({ success: false, message: "Cannot not Found The Category! Nothing To Update " })
        }
        res.status(200).json({ success: true, message: "Category Updated SuccessFully", data: UpdatedCatgeory })
    }
    catch (error) {
        res.status(500).json({ success: false, message: "Server Error:" + error.message })
    }
})

module.exports = router