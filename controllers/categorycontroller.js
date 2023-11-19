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


const categoryManagement = async (req, res) => {
    try {
        const activeCategories = await categoryCollection.find({ isDeleted: false });
        const categories = await categoryCollection.find();
        res.render('admin/category_management', { activeCategories, categories });
    } catch (error) {
        console.error(error);
        res.status(500).send('Internal Server Error');
    }
};

 

 

const addCategory = async (req, res) => {
    const { name } = req.body;

    try {
        // Check if category with the same name already exists (case-insensitive)
        const existingCategory = await categoryCollection.findOne({ name: { $regex: new RegExp('^' + name + '$', 'i') } });

        if (existingCategory) {
            return res.status(400).send('Category already exists');
        }

        const category = new categoryCollection({ name });
        await category.save();

        res.redirect('/admin/categorymanagement');
    } catch (error) {
        console.error(error);   
        res.status(500).send('Internal Server Error');
    }
}

 


const deleteCategory = async (req, res) => {
    const categoryId = req.params.id;

    try {
        const category = await categoryCollection.findByIdAndUpdate(categoryId, { isDeleted: true }, { new: true });

        if (!category) {
            return res.status(404).send('Category not found');
        }

        res.redirect('/admin/categorymanagement');
    } catch (error) {
        console.error(error);
        res.status(500).send('Internal Server Error');
    }
}


const showAddCategoryForm = (req, res) => { 
    res.render('admin/add_category');
}

const editCategory = async (req, res) => {
    const categoryId = req.params.id;
    try {
        const category = await categoryCollection.findById(categoryId);
        if (!category) {
            return res.status(404).send('Category not found');
        }
        res.render('admin/edit_category', { category });
    } catch (error) {
        console.error(error);
        res.status(500).send('Internal Server Error');
    }
};

const editCategoryPost = async (req, res) => {
    const categoryId = req.params.id;
    const newName = req.body.name;

    try {
        // Check if the category with the new name already exists (case-insensitive)
        const existingCategory = await categoryCollection.findOne({ name: { $regex: new RegExp('^' + newName + '$', 'i') } });

        if (existingCategory && existingCategory._id.toString() !== categoryId) {
            // If the category with the new name already exists (excluding the current category being edited)
            return res.status(400).send('Category already exists');
        }

        const category = await categoryCollection.findByIdAndUpdate(categoryId, { name: newName }, { new: true });

        if (!category) {
            return res.status(404).send('Category not found');
        }

        res.redirect('/admin/categorymanagement');
    } catch (error) {
        console.error(error);
        res.status(500).send('Internal Server Error');
    }
};

module.exports={
    categoryManagement,
    addCategory,
    deleteCategory,
    showAddCategoryForm,
    editCategory,
    editCategoryPost,
}