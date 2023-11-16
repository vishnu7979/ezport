const collection = require("../models/user")

const userauthentication = async (req, res, next) => {
    if (req.session.user) {
       console.log("hello session")

        next()
    } else {
        
        res.redirect('/login');
    }
};

const isBlock =async(req,res,next)=>
{
    try{
        const user = await collection.findOne({ email: req.session.user });

        if (user.isblocked) 
        {
            console.log("hello");
            res.redirect('/login');
        } 
        else 
        {
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