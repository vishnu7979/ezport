
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

const passwordcrypt = function (password) {
  const bcryptPass = bcrypt.hash(password, 8);
  return bcryptPass;
};

const profile = async (req, res) => {
    if (req.session.user) {
      try {
        const user = await collection.findOne({ email: req.session.user });
        console.log(user);
        const address = await Address.find({ userId: user._id });
        console.log(address);
        const returnedOrders = await Order.find({
          userId: user._id,
          isReturned: true,
        });
  
        const userWallet = await Wallet.findById(user.wallet);
  
        const userId = user._id;
        const orders = await Order.find({ userId }).populate(
          "products.productId"
        );
        orders.sort((a, b) => b.orderDate - a.orderDate);
  
        const reference = await Reference.findOne({ userId: user._id });
  
        res.render("user/profile", {
          user,
          address,
          orders,
          userWallet,
          returnedOrders,
          reference,
        });
      } catch (error) {
        console.error(error);
  res.render('error')
      }
    } else {
      res.redirect("/login");
    }
  };
  
  
  
  const changepassword = (req, res) => {
     res.render("user/changepassword");
  };
   
  
  const changepasswordpost = async (req, res) => {
    const currentPassword = req.body.currentPassword;
    const newPassword = req.body.newPassword;
  
    const bcryptednewPass = await passwordcrypt(newPassword)
    try {
      const user = await collection.findOne({ email: req.session.user });
      const result = await bcrypt.compare(req.body.currentPassword, user.password)
  
  
      if (user) {
        if (result) {
          await collection.updateOne({ email: req.session.user }, { $set: { password: bcryptednewPass } });
          res.redirect('/profile');
        }
        else {
          // Set error message
          const errorMessage = "Current password is incorrect";
          console.log(errorMessage);
          res.render("user/changepassword", { errorMessage }); // Pass the errorMessage to the template
        }
      } else {
        res.redirect("/login")
      }
    } catch (error) {
      console.error(error);
      res.render('error') 
    }
  };


  const submitFeedback = async (req, res) => {
    const { orderId, rating, comment } = req.body;
  
    const user = await collection.findOne({ email: req.session.user });
    userId = user._id;
  
    console.log(userId);
    console.log(orderId);
    console.log(rating);
    console.log(comment);
  
    try {
      const feedback = await Feedback.create({
        userId,
        orderId,
        rating: parseInt(rating),
        comment,
      });
      await feedback.save();
      res.json({ success: true });
    } catch (error) {
      console.error(error);
      res.render('error') 
    }
  };

  const getEditProfile=  async(req,res)=>{
    try {
     if (req.session.user) {
       const user = await collection.findOne({ email: req.session.user })
        res.render('user/editProfile',{user})
     }
    } catch (error) {
     console.log(error);
     res.redirect("/error")
    }
   };
   
   const getEditProfilePost = async (req, res) => {
     try {
         if (req.session.user) {
           const userId = req.params.id
             // Assuming you have the user data available in the request body
             const { name, email } = req.body;
             // Update the user data in the database
             const updatedUser = await collection.findByIdAndUpdate(
                 userId,
                 { name, email },
                 { new: true } 
             );
             // Redirect or render as needed
             res.redirect("/profile"); // Change the route as needed
         }
     } catch (error) {
         console.error(error);
         res.redirect("/error");
     }
   };

  module.exports={
    changepasswordpost,
    changepassword,
    profile,
    submitFeedback,
    getEditProfilePost,
    getEditProfile

  }