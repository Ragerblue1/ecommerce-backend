function errorHandler(err,req,res,next){
    if(err.name==='UnauthorizedError'){
       return res.status(401).json({name:err.name , message:err.message + " User is Not Authorized " , status:err.status})
    }
return res.status(500).json({name:err.name , message:err.message, status:err.status})
}
module.exports = errorHandler