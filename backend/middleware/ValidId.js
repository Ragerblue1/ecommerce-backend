const mongoose=require('mongoose')

const CheckValidId=(req,res,next)=>{
    const{id}=req.params;
     if(!id || !mongoose.isValidObjectId(id)){
            return res.status(400).json({success:false,message:"Id not Valid Or Id Does Not Exist!!"})
        }
    next()
}

module.exports=CheckValidId