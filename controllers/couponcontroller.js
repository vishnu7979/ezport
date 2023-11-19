 
 const collection = require("../models/user");
 const Product = require("../models/product");
 const banner = require("../models/banner");
 const categoryCollection = require("../models/category");
 const CartItem = require("../models/cart");
 const Address = require("../models/address");
 const Order = require("../models/order");
 const Feedback = require("../models/feedbackModel");
 const Wallet = require("../models/wallet");
 const coupon = require("../models/coupon");
 const Reference = require("../models/Reference");
 const bcrypt = require("bcrypt");
 const Razorpay = require("razorpay");
 const mongoose=require('mongoose')
 const secret_Id = process.env.secret_Id;
 const secret_Key = process.env.secret_Key;
 



const getCoupon =async(req,res)=>{
    
    try{ const coupons= await coupon.find()
        console.log(coupons);
    
    
        res.render('admin/Coupons',{coupons})}
        catch(error)
        {
            console.log(error);
            res.json("internal server error")
        }
}


const getaddCoupon =async (req,res)=>{
       res.render("admin/addCoupon")
}



const addCoupon = async (req, res) => {
    try {
        console.log("inside coupon controller");
        
        const { couponName, couponValue, maxValue, minValue, expiryDate } = req.body;
        console.log(couponName);
        console.log(maxValue);
        console.log(minValue);
        console.log(expiryDate);
        // Creating  a new coupon document
        const newCoupon = new coupon({
            couponName,
            couponValue,
            maxValue,
            minValue,
            expiryDate,
        });
         
        console.log(newCoupon);
        // Saving  the new coupon to the database
        await newCoupon.save();
        console.log("hai");
        // Redirect to a success page or send a success response
        res.redirect('/admin/coupons'); 
    } catch (error) {
        // Handle errors - You can redirect to an error page or send an error response
        res.status(500).send('Internal Server Error'); // Replace with your error handling logic
    }
};



const deleteCoupon = async (req, res) => {
    try {
        const couponId = req.params.couponId;
        console.log(couponId)
        await coupon.findByIdAndDelete(couponId);
        res.redirect('/admin/coupons'); // Redirect back to the admin page after deletion
    } catch (error) {
        console.error(error);
        res.status(500).send('Internal Server Error');
    }
};



module.exports={
    getCoupon,
    getaddCoupon,
    addCoupon,
    deleteCoupon,

}