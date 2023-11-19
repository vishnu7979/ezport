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



 
const addToCart = async (req, res) => {
    if (req.session.user) {
      const { productId } = req.body;
      const user = await collection.findOne({ email: req.session.user });
      try {
        const existingCartItem = await CartItem.findOne({
          userId: user._id,
          productId,
        });
  
        if (existingCartItem) {
          existingCartItem.quantity += 1;
          await existingCartItem.save();
        } else {
          const cartItem = await CartItem.create({ userId: user._id, productId });
        }
  
        res.redirect("/cart");
      } catch (error) {
        console.error(error);
        res.status(500).send("Internal Server Error");
      }
    } else {
      res.redirect("/login");
    }
  };
  
   
  const viewCart = async (req, res) => {
    console.log('show cart');
    try {
      if (req.session.user) {
        console.log('user');
        const user = await collection.findOne({ email: req.session.user });
        const product = await Product.find()
        const coupons = await coupon.find();
  
        const cartItems = await CartItem.aggregate([
          {
            $match: { userId: user._id }
          },
          {
            $lookup: {
              from: 'products',  
              localField: 'productId',
              foreignField: '_id',
              as: 'product'
            }
          },
          {
            $unwind: '$product'
          },
          {
            $project: {
              productId: '$product._id',
              quantity: 1,  
              price: '$product.price',
              name: '$product.name',
              description: '$product.description',
              image: '$product.image'
            }
          }
        ]);
  
        // Calculate the total price
        let totalPrice = 0;
  
        // Iterate through the cart items and calculate the total price
        for (const cartItem of cartItems) {
          totalPrice += cartItem.quantity * cartItem.price;
        }
  
        req.session.totalPrice = totalPrice;
  
        res.render('user/cart', { cartItems, totalPrice, user, coupons,product});
  
      } else {
        res.redirect('/login');
      }
    } catch (error) {
      console.error(error);
      res.status(500).send('Internal Server Error');
    }
  };
  
   
  
  const updateCartItem = async (req, res) => {
    try {
      const itemId = req.params.itemId;
      const newQuantity = req.body.quantity;
  
      // Find the cart item by its ID
      const cartItem = await CartItem.findById(itemId).populate('productId');
  
      if (!cartItem) {
        return res.status(404).json({ message: 'Cart item not found' });
      }
  
      // Find the corresponding product in the product collection
      const product = cartItem.productId;
      const collectionProduct = await Product.findById(product._id);
  
      if (!collectionProduct) {
        return res.status(404).json({ message: 'Product not found' });
      }
  
      const collectionProductQuantity = collectionProduct.quantity;
  
      // Check if the requested quantity exceeds the available quantity
      if (newQuantity > collectionProductQuantity) {
        return res.status(400).json({ message: 'Out Of Stock' });
      }
  
      // Update the quantity of the cart item
      const itemPrice = product.price;
      cartItem.quantity = newQuantity;
      cartItem.totalPrice = itemPrice * newQuantity;
      const newTotalPrice = cartItem.totalPrice;
      console.log("newTotalPrice:", newTotalPrice);
      // Save the updated cart item
      await cartItem.save();
      req.session.totalPrice = newTotalPrice;
      res.json({ success: true, newQuantity, newTotalPrice });
    } catch (error) {
      console.error(error);
      return res.status(500).json({ message: 'Internal server error' });
    }
  };
  
  const removeCartItem = async (req, res) => {
    const itemId = req.params.itemId;
  
    try {
      await CartItem.findByIdAndDelete(itemId);
      res.redirect("/cart");
    } catch (error) {
      console.error(error);
      res.status(500).send("Internal Server Error");
    }
  };
  

  module.exports={
    removeCartItem,
    updateCartItem,
    viewCart,
    addToCart

  }