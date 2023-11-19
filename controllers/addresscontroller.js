
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


const viewAddress = (req, res) => {
    const userId = req.session.userId;
    res.render("user/address");
  };
  
const storeAddress = async (req, res) => {
    console.log(req.body);
    console.log("req.body");
    const { userName, street, city, state, zip } = req.body;
    const user = await collection.findOne({ email: req.session.user });
    console.log(user);
    try {
      const address = await Address.create({
        userId: user._id,
        userName,
        street,
        city,
        state,
        zip,
      });
      res.redirect("/orderConfirmAll");
    } catch (error) {
      console.error(error);
      res.status(500).send("Internal Server address Error");
    }
  };
  
const displayAddress = async (req, res) => {
    if (req.session.user) {
      try {
        const user = await collection.findOne({ email: req.session.user });
        console.log("b4 user");
        console.log(user);
  
        const productId = req.params.productId;
  
        const addresses = await Address.find({ userId: user._id });
        console.log(addresses);
        res.render("user/displayAddress", { addresses, productId });
      } catch (error) {
        console.log(error.message);
        res.status(500).send("Internal Server Error");
      }
    } else {
      res.redirect("/login");
    }
  };
  
const editAddress = async (req, res) => {
    const addressId = req.params.id;
  
    try {
      const address = await Address.findById(addressId);
      if (!address) {
        return res.status(404).send("Address not found");
      }
      console.log(address);
      res.render("user/edit_adress", { address });
    } catch (error) {
      console.error(error);
      res.status(500).send("Internal Server Error");
    }
  };
  
const updateAddress = async (req, res) => {
    const addressId = req.params.id;
    const { userName, street, city, state, zip } = req.body;
  
    try {
      const updatedAddress = await Address.findByIdAndUpdate(
        addressId,
        {
          userName,
          street,
          city,
          state,
          zip,
        },
        { new: true }
      );
  
      // res.redirect('/displayaddress');
      res.redirect("/displayaddress");
    } catch (error) {
      console.error(error);
      res.status(500).send("Internal Server Error");
    }
  };
  
   module.exports={
    viewAddress,
    storeAddress,
    displayAddress,
    editAddress,
    updateAddress,
   }
  