
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
  
  
  
  const forgotpassword = (req, res) => {
    res.render("user/forgotpassword", { msg: "" });
  };
  
  const forgotpasswordpost = async (req, res) => {
    const email = req.body.email;
    console.log(email);
    try {
      const { email } = req.body;
      const check = await collection.findOne({ email: req.body.email });
      if (check) {
        const otp = generateOTP();
        console.log(otp);
        if (check.isblocked) {
          res.render("user/login", { error: "you are blocked by admin !!!" });
        }
        req.session.user = req.body.email;
        req.session.otp = otp; // Store OTP in session
        req.session.requestedOTP = true;
        // Send the OTP to the user (you may use a notification library or email)
  
        await sendOTPByEmail(email, otp);
        res.render("user/otp", {
          msg: "Please enter the OTP sent to your email",
        });
      } else {
        res.render("user/login", { error1: "User not found !!!" });
      }
    } catch (error) {
      console.error(error);
      res.render('error') 
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

  module.exports={
    changepasswordpost,
    changepassword,
    forgotpasswordpost,
    forgotpassword,
    profile,
    submitFeedback

  }