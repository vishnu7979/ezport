const mongoose=require('mongoose')

mongoose.connect("mongodb://127.0.0.1:27017/mini_project")
.then(()=>{
   console.log("mongodb connected !!!"); 
})
.catch(()=>{
    console.log("not connected ");
})


const LogInSchema=new mongoose.Schema({
    name:{
        type:String,
        required:true
    },
    email:{
        type:String,
        required:true
    },
    password:{
        type:String,
        required:true

    },
    isblocked:{
        type:Boolean,
        default:false

    },
    address: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Address'
    },  

    wallet: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Wallet'
    }
    
}) 


const collection=mongoose.model("Collection1",LogInSchema)

module.exports=collection