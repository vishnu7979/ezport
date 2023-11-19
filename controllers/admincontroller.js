const collection = require('../models/user');
const Product = require('../models/product');  
const categoryCollection = require('../models/category');
const Order = require('../models/order');
const Wallet = require('../models/wallet');
const coupon = require("../models/coupon")
const banner = require("../models/banner")


const login = (req, res) => {
     if(req.session.admin){
        res.redirect('/admin/dashboard')
      }
     res.render('admin/login', { msg: '' });
}

const dashboard = async (req, res) => {
    if(req.session.admin){
        const order = await Order.find().populate('products.productId').populate("userId")
         res.render('admin/dashboard', { msg:'' ,order });
    }
    else{
        res.redirect('/admin/login')
    }
}



const adminlogout = (req, res) => {
    req.session.destroy((err) => {
      if (err) {
        console.error("Error destroying session:", err);
      }
      res.redirect("/admin/login");
    });
  };



const loginpost = async (req, res) => {
    const name = 'admin'
    const password = 123456789
    const order = await Order.find().populate('products.productId').populate("userId")


    if(name == req.body.username && password == req.body.password){
        req.session.admin = name;
        const msg1=req.body.username;
        res.redirect('/admin/dashboard')
    } else {
        console.log('here');
        res.render('admin/login', { errormsg: 'invalid username or password :(' })
    }
}



const userDetails = async (req, res) => {
    try {
        const users = await collection.find();
        res.render('admin/userDetails', { users });
    } catch (error) {
        console.error(error);
        res.status(500).send('Internal Server Error');
    }
}

const blockUser = async (req, res) => {
    try {
        const userId = req.params.id;
        const user = await collection.findById(userId);

        if (!user) {
            return res.status(404).send('User not found');
        }

        user.isblocked = true;
        await user.save();


 
        req.session.destroy((err) => {
            if (err) {
                console.error('Error destroying session:', err);
            }
             
        });


        res.redirect('/admin/userDetails');
    } catch (error) {
        console.error(error);
        res.status(500).send('Internal Server Error');
    }
}

const unblockUser = async (req, res) => {
    try {
        const userId = req.params.id;
        const user = await collection.findById(userId);

        if (!user) {
            return res.status(404).send('User not found');
        }

        user.isblocked = false;
        await user.save();

        res.redirect('/admin/userDetails');
    } catch (error) {
        console.error(error);
        res.status(500).send('Internal Server Error');
    }
}

 
const getError = (req, res) => {
    res.render('admin/404')
  }

 

module.exports = {
    login,
    loginpost,
    dashboard,
    adminlogout,
    userDetails,
    blockUser,
    unblockUser,
    getError
    
}
