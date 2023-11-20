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


const wallethistory = async (req, res) => {
    if (req.session.user) {
      try {
        const userEmail = req.session.user;
  
        // Fetch the user ID based on the email
        const user = await collection.findOne({ email: userEmail }).populate('wallet');
        if (!user) {
          return res.render('error');
        }
  
        const wallet = user.wallet;
  
        // Fetch wallet transactions using aggregation
        const walletData = await Wallet.aggregate([
          {
            $match: { _id: new mongoose.Types.ObjectId(wallet._id) }
          },
          {
            $unwind: '$transactions'
          },
          {
            $sort: { 'transactions.date': -1 } // Sort by date in descending order
          },
          {
            $limit: 10 // Limit to the most recently made ten transactions
          },
          {
            $project: {
              date: '$transactions.date',
              amount: '$transactions.amount',
              type: {
                $cond: {
                  if: { $gt: ['$transactions.amount', 0] },
                  then: 'Credit',
                  else: 'Debit'
                }
              }
            }
          }
        ]);
  
        const transactions = walletData.map(transaction => ({
          date: transaction.date,
          amount: transaction.amount,
          type: transaction.type
        }));
  
        res.render('user/walletHistory', { transactions });
      } catch (error) {
        console.error(error);
        res.render('error') 
      }
    } else {
      res.redirect('/login');
    }
  };

  
  
  module.exports={
    wallethistory
  }