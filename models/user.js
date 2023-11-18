const mongoose=require('mongoose')
 const atlas_URL=process.env.atlas_URL
mongoose.connect(atlas_URL)
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