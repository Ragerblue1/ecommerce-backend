const validUser=(req,res,next)=>{
    const UserDeatilsToUpdate=Object.keys(req.body);

    if(UserDeatilsToUpdate.length===0){
        return res.status(400).json({ message: "Nothing to update" });
    }

    const Validator={
        name:(val)=>val && val.trim().length > 0,
        email:(val)=>/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val),
        phoneNumber:(val)=>/^\d{10}$/.test(val),

    }

    const Filtereddata={};
    for(let fields of UserDeatilsToUpdate){
        if(Validator[fields]){
            const isValid=Validator[fields](req.body[fields])
            if(isValid){
               Filtereddata[fields]=req.body[fields];
            }
            else{
                return res.status(400).json({ message: `Invalid ${field}` });
            }
        }
    }
req.validData=Filtereddata
next()
}

module.exports=validUser