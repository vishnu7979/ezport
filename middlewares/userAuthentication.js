const collection = require("../models/user")

const userauthentication = async (req, res, next) => {
    if (req.session.user) {
       console.log("inside userAuthentication")

        next()
    } else {
        console.log("not inside userAuthentication")

        res.redirect('/login');
    }
};

const isBlock =async(req,res,next)=>
{
    try{
        const user = await collection.findOne({ email: req.session.user });

        if (user.isblocked) 
        {
            console.log("not inside userAuthentication")
            res.redirect('/login');
        } 
        else 
        {
            console.log("inside userAuthentication block")

             next();
        }
    }catch(error){
       res.send("internal server error ")
    }
    
}

module.exports = {
    userauthentication,
    isBlock
}