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


const addproduct = async (req, res) => {
    let categories = await categoryCollection.find({ isDeleted: false });
    res.render('admin/product_form', { categories })
}


const multer = require('multer');
const upload = multer({ dest: 'public/uploads/' });

const addproductpost = async (req, res) => {
    const { name, description, price, category,quantity,offer } = req.body;

    const image = req.files.image[0] ? req.files.image[0].filename : '';
    const additionalImages = req.files.additionalImages ? req.files.additionalImages.map(file => file.filename) : [];

    try {
        const product = new Product({
            name,
            description,
            price,
            category,
            image, 
            additionalImages,
            quantity,
            offer
        });

        await product.save();

        let categories = await categoryCollection.find({ isDeleted: false });
        res.render('admin/product_form', { categories });
    } catch (error) {
        console.error(error);
        res.render('admin/404')
      }
};

 
const showProducts = async (req, res) => {
    try {
        console.log("showing");
        const delCat = await categoryCollection.find({isDeleted:true},{_id : 0, name : 1})
        let arr = []
        for(let each of delCat){
            arr.push(each.name)
        }

        let searchQuery = req.query.searchQuery;
        let page = parseInt(req.query.page) || 1;
        let limit = 3; // Adjust the limit as per your preference

        const regexPattern = new RegExp(searchQuery, 'i');

        const products = await Product.find({
            isDeleted: { $in: [false, null] },
            category: { $nin: arr },
            $or: [
                { name: regexPattern },
                { description: regexPattern },
                { category: regexPattern }
            ]
        }).skip((page - 1) * limit).limit(limit);

        const deletedProducts = await Product.find({ isDeleted: true });
        const activeCategories = await categoryCollection.find({ isDeleted: false });

        res.render('admin/show_products', { products, deletedProducts, activeCategories, page, limit, searchQuery });
    } catch (error) {
        console.error(error);
        res.render('admin/404')
    }
}


const editProduct = async (req, res) => {
    const productId = req.params.id;
    try {
        const product = await Product.findById(productId);
        const categories = await categoryCollection.find({ isDeleted: false });
        if (!product) {
            return res.status(404).send('Product not found');
        }
        res.render('admin/edit_product', { product, categories });
    } catch (error) {
        console.error(error);
        res.render('admin/404')
    }
};

 
const updateProduct = async (req, res) => {
    const productId = req.params.id;
    const { name, description, price, category, offer,quantity } = req.body;
    const image = req.files.image[0] ? req.files.image[0].filename : '';
    const additionalImages = req.files.additionalImages ? req.files.additionalImages.map(file => file.filename) : [];

    try {
        let updatedPrice = price; // Initialize updated price with the original price

        // Apply offer if it is greater than zero
        if (offer > 0) {
            const offerAmount = (offer / 100) * price; // Calculate offer amount
            updatedPrice = Math.floor(price - offerAmount); // Calculate updated price after applying offer
        }

        const updatedProduct = await Product.findByIdAndUpdate(productId, {
            name,
            description,
            price: updatedPrice, // Use the updated price
            category,
            image,
            quantity,
            additionalImages,
            offer
        }, { new: true });

        if (!updatedProduct) {
            return res.status(404).send('Product not found');
        }

        res.redirect('/admin/showproducts');
    } catch (error) {
        console.error(error);
        res.render('admin/404')
    }
};



const showProductss = async (req, res) => {
    try {
      const page = req.query.page || 1; // Get the requested page from the query parameter
      const itemsPerPage = 6; // Number of items to display per page
  
      const delCat = await categoryCollection.find(
        { isDeleted: true },
        { _id: 0, name: 1 }
      );
      let arr = [];
      for (let each of delCat) {
        arr.push(each.name);
      }
  
      // Calculate the number of items to skip based on the page number
      const skip = (page - 1) * itemsPerPage;
  
      let products;
  
      if (req.query.searchQuery) {
        products = await Product.find({
          isDeleted: { $in: [false, null] },
          category: { $nin: arr },
          $or: [
            { name: { $regex: req.query.searchQuery, $options: "i" } },
            { category: { $regex: req.query.searchQuery, $options: "i" } },
          ],
        })
          .skip(skip)
          .limit(itemsPerPage);
      } else {
        products = await Product.find({
          isDeleted: { $in: [false, null] },
          category: { $nin: arr },
        })
          .skip(skip)
          .limit(itemsPerPage);
      }
  
      const deletedProducts = await Product.find({ isDeleted: true });
      const activeCategories = await categoryCollection.find({
        isDeleted: false,
      });
  
      const totalProducts = await Product.countDocuments({
        isDeleted: { $in: [false, null] },
        category: { $nin: arr },
      });
  
      const totalPages = Math.ceil(totalProducts / itemsPerPage);
  
      res.render("user/product", {
        products,
        deletedProducts,
        activeCategories,
        searchQuery: req.query.searchQuery,
        page,
        totalPages, // Pass the total number of pages to the template
      });
    } catch (error) {
      console.error(error);
      res.render('error')
    }
  };
  

  const displayProducts = async (req, res) => {
    try {
      const page = req.query.page || 1; // Get the requested page from the query parameter
      const itemsPerPage = 6; // Number of items to display per page
  
      const delCat = await categoryCollection.find(
        { isDeleted: true },
        { _id: 0, name: 1 }
      );
      let arr = [];
      for (let each of delCat) {
        arr.push(each.name);
      }
  
      // Calculate the number of items to skip based on the page number
      const skip = (page - 1) * itemsPerPage;
  
      const products = await Product.find({
        isDeleted: { $in: [false, null] },
        category: { $nin: arr },
      })
        .skip(skip)
        .limit(itemsPerPage);
  
      const deletedProducts = await Product.find({ isDeleted: true });
      const activeCategories = await categoryCollection.find({
        isDeleted: false,
      });
  
      const totalProducts = await Product.countDocuments({
        isDeleted: { $in: [false, null] },
        category: { $nin: arr },
      });
  
      const totalPages = Math.ceil(totalProducts / itemsPerPage);
  
      res.render("user/product", {
        products,
        deletedProducts,
        activeCategories,
        page,
        totalPages, // Pass the total number of pages to the template
      });
    } catch (error) {
      console.error(error);
      res.render('error')
    }
  };
  
  

  const viewProductDetails = async (req, res) => {
     const productId = req.params.id;
   
    const product = await Product.findById(productId);
    const products = await Product.find();
  
    res.render("user/product_details", { product, products });
    // Product.findById(productId, (err, product) => {
    //     if (err) {
    //         console.error(err);
    //         return res.status(500).send('Internal Server Error');
    //     }
    //     if (!product) {
    //         return res.status(404).send('Product not found');
    //     }
  
    //     console.log('Product found:', product); // Add this line
    //     console.log("Rendering product_details.ejs"); //
    //     res.render('user/product_details', { product }); // Check if the view file name is correct
    // });
  };


  const filterProducts = async (req, res) => {
    try {
      const selectedCategory = req.query.category;
      const searchQuery = req.query.searchQuery;
      const priceRange = req.query.priceRange; // Add this line to get the selected price range
      const page = req.query.page || 1;
      const itemsPerPage = 6;
  
      let filter = {
        isDeleted: { $in: [false, null] },
      };
  
      if (selectedCategory) {
        filter.category = selectedCategory;
      }
  
      if (searchQuery) {
        filter.$or = [
          { name: { $regex: searchQuery, $options: 'i' } },
          { category: { $regex: searchQuery, $options: 'i' } },
        ];
      }
  
      if (priceRange) {
        // Handle the selected price range
        switch (priceRange) {
          case 'below500':
            filter.price = { $lt: 500 };
            break;
          case '500-1000':
            filter.price = { $gte: 500, $lte: 1000 };
            break;
          case '1000-2000':
            filter.price = { $gte: 1000, $lte: 2000 };
            break;
          case 'above2000':
            filter.price = { $gt: 2000 };
            break;
        }
      }
  
      const totalProducts = await Product.countDocuments(filter);
      const totalPages = Math.ceil(totalProducts / itemsPerPage);
  
      const skip = (page - 1) * itemsPerPage;
  
      // Only fetch products for the current page, not all products
      const filteredProducts = await Product.find(filter)
        .skip(skip)
        .limit(itemsPerPage);
  
      // Render the product partial and send it back to the client
      res.render('partials/productPartial', { products: filteredProducts }, (err, productHtml) => {
        if (err) {
          console.error('Error rendering product partial:', err);
          res.status(500).send('Internal Server Error');
        } else {
          // Render the pagination partial and send it back to the client
          res.render('partials/paginationPartial', { page, totalPages }, (err, paginationHtml) => {
            if (err) {
              console.error('Error rendering pagination partial:', err);
              res.status(500).send('Internal Server Error');
            } else {
              res.json({ products: productHtml, pagination: paginationHtml });
            }
          });
        }
      });
    } catch (error) {
      console.error('Error filtering products:', error);
      res.render('error')
    }
  };
  


module.exports={
    addproductpost,
    addproduct,
    showProducts,
    updateProduct,
    editProduct,
    showProductss,
    displayProducts,
    viewProductDetails,
    filterProducts

}