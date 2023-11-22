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


const getbanner = async (req, res) => {
    try {
      const bannerData = await banner.find({ isDeleted: false });
      // Render the banners page with bannerData
      res.render('admin/banner', { bannerData });
    } catch (err) {
      console.error("Error is ", err);
      // Render the banners page with an error message or redirect to an error page
      res.render('admin/404')
    }
  };

  
  const addBanner= (req, res) => {
    res.render('admin/addBanner');
  };

  
  const addBannerPost = async (req, res) => {
    const { name, description } = req.body;
  console.log(name,description);
    try {
      const newbanner = new banner({
        name,
        description,
        image: req.file ? req.file.filename : '',  
      });
  
      await newbanner.save();
      res.redirect('/admin/banners');  
    } catch (error) {
      console.error(error);
      res.render('admin/404')
    }
  };
  
 
  const deleteBanner = async (req, res) => {
    const bannerId = req.params.id;
  
    try {
      // Find the banner by ID and update the isDeleted field to true
      await banner.findByIdAndUpdate(bannerId, { isDeleted: true });
      
      res.redirect('/admin/banners'); // Redirect to the banners page after deletion
    } catch (error) {
      console.error(error);
      res.render('admin/404')
    }
  };
  

  module.exports={
    getbanner,
    addBanner,
    addBannerPost,
    deleteBanner,
  }