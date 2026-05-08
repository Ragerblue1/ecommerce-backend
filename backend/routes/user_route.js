require('dotenv').config()
const User = require('../models/users')
const express = require('express')
const router = express.Router()
const bcrypt = require('bcryptjs')
const CheckValidId = require('../middleware/ValidId.js')
const validUser = require('../middleware/userValidator.js')
router.use(express.json())
const jwt = require('jsonwebtoken')
//getting all users
router.get('/', async (req, res) => {
    try {
        const userList = await User.find().select("-passwordHash");
        if (!userList) {
            return res.status(404).json({ success: false, message: "Users Not Found" })
        }
        return res.status(200).json({ success: true, data: userList })
    } catch (error) {
        return res.status(500).json({ success: false, message: "Server Error " + error.message })
    }

})


//getting single user by id
router.get('/:id', CheckValidId, async (req, res) => {
    const { id } = req.params;
    try {
        const getUser = await User.findById(id).select("name email phoneNumber isAdmin ");
        if (!getUser) {
            return res.status(400).json({ success: false, message: "User Does Not Exist" })
        }
        return res.status(200).json({ success: true, message: "User Found", data: getUser })
    } catch (error) {
        res.status(500).json({
            success: false,
            error: error.message
        });
    }

})

//post user details
router.post('/register', async (req, res) => {
    const { name, email, password, phoneNumber, isAdmin, appartment, city, street, zipCode, country } = req.body;
    try {

        if (!name || !email || !password || !phoneNumber) {
            return res.status(400).json({ success: false, message: "Missing required fields" });
        }


        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            return res.status(400).json({ success: false, message: "Invalid Email Format" });
        }


        if (password.length < 6) {
            return res.status(400).json({ success: false, message: "Password must be at least 6 characters" });
        }

        const phoneRegex = /^\d{10}$/;
        if (!phoneRegex.test(phoneNumber)) {
            return res.status(400).json({ success: false, message: "Invalid Phone Number" });
        }
        const Hashedpassword = await bcrypt.hash(password, 10)


        const newUser = new User({
            name, email, passwordHash: Hashedpassword, phoneNumber, appartment, street, city, country, zipCode, isAdmin
        })
        const newlyCretedUser = await newUser.save()
        return res.status(201).json({ success: true, message: "User Craeted SuccesFully", data: newlyCretedUser })
    } catch (error) {
        res.status(500).json({
            success: false,
            error: error.message
        });
    }

})

//Update UserDeatils
router.patch('/:id', CheckValidId, validUser, async (req, res) => {
    const { id } = req.params;

    try {
        const UpdatedUserDetails = await User.findByIdAndUpdate(id, req.validData, { new: true });
        if (!UpdatedUserDetails) {
            return res.status(404).json({ success: false, message: "User Not Found To Update The Details " })
        }
        return res.status(200).json({ success: true, message: "Users Details Updated ", data: UpdatedUserDetails })
    } catch (error) {
        return res.status(500).json({ success: false, message: "Server Error:-" + error.message })
    }
})

// login user 
router.post('/login', async (req, res) => {
    const { reqEmail, reqPassword } = req.body
    const EmailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const secret = process.env.JSONWEBTOKENSECRET
    if (!EmailRegex.test(reqEmail)) {
        return res.status(400).json({ success: false, message: "Invalid Email Format" });
    }
    try {
        const user = await User.findOne({ email: reqEmail });
        if (!user) {
            return res.status(400).json({ message: "Email or Password Incorrect" })
        }
        if (user && bcrypt.compareSync(reqPassword, user.passwordHash)) {
            const token = jwt.sign(
                {
                    userId: user.id,
                    isAdmin: user.isAdmin
                }
                , secret
                , { expiresIn: '1d' }
            )
            return res.status(200).json({ success: true, message: `Welcome ${user.name}`, user: user.email, token: token })
        }
        else {
            return res.status(400).json({ message: "Password Incorrect" })
        }
    } catch (error) {
        return res.status(500).json({ success: false, message: "Server Error:- " + error.message });
    }
})
module.exports = router