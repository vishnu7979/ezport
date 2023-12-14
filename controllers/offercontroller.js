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



const sendCategoryOffer = async (req, res) => {
    console.log("hello there");
    try {
        const activeCategories = await categoryCollection.find({ isDeleted: false });
        const categories = await categoryCollection.find();
        res.render('admin/categoryoffer', { activeCategories, categories });
    } catch (error) {
        console.error(error);
        res.render('admin/404')
    }
};  



const applyOffer = async (req, res) => {
    const { categoryId, percentage } = req.body;

    try {
        // Find the category by its ID
        const category = await categoryCollection.findById(categoryId);

        if (!category) {
            return res.status(404).json({ success: false, message: 'Category not found' });
        }

        // Find all products belonging to the category
        const products = await Product.find({ category: category.name });

         for (const product of products) {
            const updatedPrice = Math.floor(product.price - (product.price * (percentage / 100)));
            const realPrice=product.price;
            product.price = updatedPrice;
            product.realPrice=realPrice;
            await product.save();
        }

        return res.json({ success: true, message: 'Offer applied successfully' });
    } catch (error) {
        console.error(error);
        res.render('admin/404')
    }
};



const claimReferenceCode = async (req, res) => {
    try {
      const { referenceCode } = req.body;
      const reference = await Reference.findOne({ referenceCode });
  
      if (!reference) {
        return res.status(400).json({ message: "Invalid reference code" });
      }
  
      const user = await collection
        .findOne({ email: req.session.user })
        .populate("wallet");
  
      if (!user) {
        return res.status(500).json({ message: "Internal Server Error" });
      }
  
      // Check if the reference code has already been used by the current user
      if (reference.usedBy.includes(user._id)) {
        return res.status(400).json({ message: "Reference code already used" });
      }

      if (reference.userId.equals(user._id)) {
        return res.status(400).json({ message: "Cannot claim your own referral code" });
      }
  
      // Mark the reference code as used by the current user
      reference.usedBy.push(user._id);
      await reference.save();
  
      // Increase wallet balances
      if (user.wallet) {
        // Add the credited amount to the wallet transactions
        user.wallet.transactions.push({
          amount: 100,
          type: 'Credit',
        });
  
        user.wallet.balance += 100; // Increase user's wallet by 100 rupees
        await user.wallet.save();
      } else {
        const newWallet = new Wallet({ balance: 100 });
        // Add the credited amount to the wallet transactions
        newWallet.transactions.push({
          amount: 100,
          type: 'Credit',
        });
  
        await newWallet.save();
        user.wallet = newWallet;
      }
  
      // Increase session user's wallet balance
      const referenceuser = await collection
        .findById(reference.userId)
        .populate("wallet");
  
      if (referenceuser.wallet) {
        // Add the credited amount to the wallet transactions
        referenceuser.wallet.transactions.push({
          amount: 100,
          type: 'Credit',
        });
  
        referenceuser.wallet.balance += 100; // Increase user's wallet by 100 rupees
        await referenceuser.wallet.save();
      } else {
        const newWallet = new Wallet({ balance: 100 });
        // Add the credited amount to the wallet transactions
        newWallet.transactions.push({
          amount: 100,
          type: 'Credit',
        });
  
        await newWallet.save();
        referenceuser.wallet = newWallet;
      }
  
      await user.save();
  
      return res
        .status(200)
        .json({ message: "Reference code claimed successfully" });
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: "Internal Server Error" });
    }
  };



// const applyCoupon = async (req, res) => {
//     try {
       
//       const couponCode = req.body.couponCode;
  
//       const totalprice = req.body.totalPrice;
  
//       const couponData = await coupon.findOne({ couponName: couponCode });
  
//       console.log(couponData);
  
//       const couponDiscount = Math.floor(
//         (totalprice * couponData.couponValue) / 100
//       );
//       console.log(couponDiscount);
//       const grantTotal = totalprice - couponDiscount;
  
      
//       const user = await collection.findOne({ email: req.session.user });
//       const userId = user._id;  
  
//       if (!couponData.appliedUsers.includes(userId)) {
        
//         couponData.appliedUsers.push(userId);
   
//         await couponData.save();
//       }
  
//       res.json({ grantTotal, couponDiscount });
//     } catch (error) {
//       console.error(error);
//       res.status(500).send("Internal Server Error");
//     }
// };
  
  
const applyCoupon = async (req, res) => {
  try {
    // Get the coupon code and total price from the request body
    const { couponCode, totalPrice } = req.body;

    // Find the coupon data by coupon code
    const couponData = await coupon.findOne({ couponName: couponCode });

    // Check if the coupon is expired
    const currentDate = new Date();
    if (couponData.expiryDate && couponData.expiryDate < currentDate) {
      return res.status(400).json({ error: 'Coupon has expired' });
    }

    // Check if the total price is greater than the minimum value of the coupon
    if (totalPrice < couponData.minValue) {
      return res.status(400).json({ error: 'Total price is less than the minimum value required for this coupon' });
    }

    // Calculate coupon discount and grant total
    const couponDiscount = Math.floor((totalPrice * couponData.couponValue) / 100);
    const grantTotal = totalPrice - couponDiscount;

    // Assuming userId is available in your request or from your authentication system
    const user = await collection.findOne({ email: req.session.user });
    const userId = user._id; // Adjust this based on how you store user information
console.log(userId);
    if (!couponData.appliedUsers.includes(userId)) {
      // Push the user's ID to the appliedUsers array
      couponData.appliedUsers.push(userId);

      // Save the coupon data with the updated appliedUsers array
      await couponData.save();
    }

    res.json({ grantTotal, couponDiscount });
  } catch (error) {
    console.error(error);
    res.status(500).send('Internal Server Error');
  }
};


const removeCoupon = async (req, res) => {
  try {
    
    const { totalPrice } = req.body;

   
    const user = await collection.findOne({ email: req.session.user });
    const userId = user._id; 

    // Find the coupon data that was previously applied to the user
    const couponData = await coupon.findOne({
      appliedUsers: userId,
    });

    // Check if the user has a coupon applied
    if (!couponData) {
      return res.status(400).json({ error: 'No coupon applied to the user' });
    }

    // Remove the user from the appliedUsers array
    const userIndex = couponData.appliedUsers.indexOf(userId);
    if (userIndex !== -1) {
      couponData.appliedUsers.splice(userIndex, 1);
    }

    // removing the coupon discount
    console.log("total price is :",totalPrice);
    
    const couponDiscount = Math.floor((totalPrice * couponData.couponValue) / 100);
    const grantTotal = totalPrice;
    // grantTotal= totalPrice;
    console.log("new granttotal is :",grantTotal);

   
    await couponData.save();

    res.json({ grantTotal, couponDiscount });
  } catch (error) {
    console.error(error);
    res.status(500).send('Internal Server Error');
  }
};

 module.exports={
    sendCategoryOffer,
    applyOffer,
    claimReferenceCode,
    applyCoupon,
    removeCoupon

 }