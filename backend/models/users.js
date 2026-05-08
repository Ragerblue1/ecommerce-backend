const mongoose = require('mongoose')

const userSchema = mongoose.Schema(
    {
        name:{
            type:String,
            required:true,
            trim:true
        },
        email:{
            type:String,
            required:true,
            unique:true,
            lowercase: true
        },
        passwordHash:{
            type:String,
            required:true,
        },
        phoneNumber:{
            type:String,
            required:true,
        },
        isAdmin:{
            type:Boolean,
            default:false
        },
        appartment:{
            type:String,
            default:''
        },
        city:{
             type:String,
             default:""
        },
        country:{
            type:String,
            required:true,
        },
        street:{
             type:String,
             default:""
        },
        zipCode:{
            type:String,
            required:true,
        },
    }
, { timestamps: true })


userSchema.virtual('id').get(function(){
    return this._id.toHexString()
})

userSchema.set('toJSON',{
    virtuals:true
})


module.exports = mongoose.model("User", userSchema)
