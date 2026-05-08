const mongoose=require('mongoose');

const CategorySchema=mongoose.Schema(
    {
        name:{
            type:String,
            required:true,
            unique:true,
        },

        color:{
            type:String,

        },

        icon:{
            type:String,

        },
        
        image:{
            type:String,

        },
}
,{timestamps:true})


module.exports=mongoose.model('Category',CategorySchema)