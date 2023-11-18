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


const chart = async (req, res) => {
    console.log("hai");
    if (req.session.admin) {
      try {
        // Aggregate data for the daily chart
        const dayChart = await Order.aggregate([
          {
            $group: {
              _id: { $dateToString: { format: "%Y-%m-%d", date: "$orderDate" } },
              count: { $sum: 1 }
            }
          },
          {
            $sort: { _id: 1 } // Sort by date in ascending order
          },
          {
            $limit: 30 // Limit to the last 30 days
          }
        ]);
  
        // Aggregate data for the monthly chart
        const monthChart = await Order.aggregate([
          {
            $group: {
              _id: { $dateToString: { format: "%Y-%m", date: "$orderDate" } },
              count: { $sum: 1 }
            }
          },
          {
            $sort: { _id: 1 } // Sort by month in ascending order
          }
        ]);
  
        // Aggregate data for the yearly chart
        const yearChart = await Order.aggregate([
          {
            $group: {
              _id: { $dateToString: { format: "%Y", date: "$orderDate" } },
              count: { $sum: 1 }
            }
          },
          {
            $sort: { _id: 1 } // Sort by year in ascending order
          }
        ]);
  
        // Aggregate data for the payment method chart
        const paymentMethodChart = await Order.aggregate([
          {
            $group: {
              _id: "$paymentMethod",
              count: { $sum: 1 }
            }
          }
        ]);
  
        // Aggregate data for today's orders
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const todaysOrder = await Order.countDocuments({
          orderDate: { $gte: today }
        });
  
        // Aggregate data for total orders
        const totalOrder = await Order.countDocuments();
  
        // Aggregate data for average order count in the current year
        const avgOrder = await Order.aggregate([
          {
            $match: {
              orderDate: { $gte: new Date(`${new Date().getFullYear()}-01-01`) }
            }
          },
          {
            $group: {
              _id: null,
              avgOrder: { $avg: 1 }
            }
          }
        ]);
  
        // Aggregate data for average revenue
        const totalRevenue = await Order.aggregate([
          {
            $group: {
              _id: null,
              totalRevenue: { $sum: "$grandTotal" },
              count: { $sum: 1 } // Debugging: count the documents
            }
          }
        ]);
        
        console.log("totalRevenue aggregation result:", totalRevenue);
        
        console.log("todaysOrder is:", todaysOrder);
        console.log("totalOrder is:", totalOrder);
        console.log("avgOrder is:", avgOrder);
        console.log("totalRevenue is:", totalRevenue);
        
  
        console.log(dayChart);
        console.log(monthChart);
        console.log(yearChart);
        console.log(paymentMethodChart);
        console.log("todaysOrder is:", todaysOrder);
        console.log("totalOrder is:", totalOrder);
        console.log("avgOrder is:", avgOrder);
        console.log("totalRevenue is:", totalRevenue);
  
        const datesDay = dayChart.map(item => item._id);
        const orderCountsDay = dayChart.map(item => item.count);
        let dayData = { dates: datesDay, orderCounts: orderCountsDay };
  
        const datesMonth = monthChart.map(item => item._id);
        const orderCountsMonth = monthChart.map(item => item.count);
        let monthData = { dates: datesMonth, orderCounts: orderCountsMonth };
  
        const datesYear = yearChart.map(item => item._id);
        const orderCountsYear = yearChart.map(item => item.count);
        let yearData = { dates: datesYear, orderCounts: orderCountsYear };
  
        const paymentMethodLabels = paymentMethodChart.map(item => item._id);
        const orderCountsByPaymentMethod = paymentMethodChart.map(item => item.count);
        let paymentMethodData = { labels: paymentMethodLabels, orderCounts: orderCountsByPaymentMethod };
  
        // Send data as JSON response
       res.json({
          dayData,
          monthData,
          yearData,
          paymentMethodData,
          todaysOrder,
          totalOrder,
          avgOrder: avgOrder.length > 0 ? avgOrder[0].avgOrder : 0,
          totalRevenue: totalRevenue.length > 0 ? totalRevenue[0].totalRevenue : 0
        });
  
        console.log("dayData is:", dayData);
        console.log("monthData is:", monthData);
        console.log("yearData is:", yearData);
        console.log("paymentMethodData is:", paymentMethodData);
      } catch (error) {
        console.error('Error fetching data:', error);
        res.status(500).json({ error: 'Internal Server Error' });
      }
    } else {
      res.status(403).json({ error: 'Unauthorized'});
    }
  };
  


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
            // res.redirect('/'); // Redirect to login page
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
        res.status(500).send('Internal Server Error');
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
        res.status(500).send('Internal Server Error');
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
        res.status(500).send('Internal Server Error');
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
        res.status(500).send('Internal Server Error');
    }
};



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


const toggleProductAvailability = async (req, res) => {
    try {
        const productId = req.params.id;
        const product = await Product.findById(productId);

        if (!product) {
            return res.status(404).send('Product not found');
        }

        product.isDeleted = !product.isDeleted;
        await product.save();

        res.redirect('/admin/showproducts');
    } catch (error) {
        console.error(error);
        res.status(500).send('Internal Server Error');
    }
};


 

const showOrderManagement = async (req, res) => {
    try {
        const order = await Order.find().populate('products.productId').populate("userId")
        
        // Check if any order has been returned
        const hasReturnedOrder = order.some(order => order.isReturned);

        if (!Order) {
            throw new Error('No orders found');
        }
console.log("insideom");
        res.render('admin/orderManagement', { order, hasReturnedOrder });
    } catch (error) {
        console.error("error");
        res.status(500).send('Internal Server Error');
    }
};

  
  
const updateOrderStatus = async (req, res) => {
    try {
        const orderId = req.params.orderId;
        const newStatus = req.params.newStatus;

        const updatedOrder = await Order.findByIdAndUpdate(
            orderId,
            { status: newStatus },
            { new: true } // Set to true to return the updated order
        );

        if (updatedOrder) {
            if (newStatus === 'Canceled') {
                const user = await collection.findOne({ email: req.session.user }).populate('wallet');

                if (user) {
                    const totalPrice = updatedOrder.totalPrice;

                    if (user.wallet) {
                        user.wallet.balance += totalPrice;
                        await user.wallet.save();
                    } else {
                        const newWallet = new Wallet({ balance: totalPrice });
                        await newWallet.save();
                        user.wallet = newWallet;
                    }

                    await user.save();
                }
            }
            res.json({ success: true });
        } else {
            // Order not found or status update failed
            res.json({ success: false });
        }
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false });
    }
}



 
const acceptreturn = async (req, res) => {
    const orderId = req.body.orderId;
    console.log(orderId);

    try {
        const order = await Order.findOne({ _id: orderId });

        if (!order) {
            return res.status(404).json({ success: false, message: 'Order not found' });
        }

        const user = await collection.findOne({ email: req.session.user }).populate('wallet');
        console.log(user);

        const WWallet = await Wallet.findOne({ _id: user.wallet.id });
        console.log(WWallet.balance);

        if (!user) {
            return res.status(401).json({ success: false, message: 'User not authenticated' });
        }

        console.log(order.acceptReturn);

        // Check if paymentMethod is not "cashOnDelivery" before updating the wallet
        if (order.paymentMethod !== "cashOnDelivery") {
            order.set({ acceptReturn: true });

            const tprice = order.totalPrice;
            const variable = WWallet.balance + tprice;

            // Update the wallet balance only if paymentMethod is not "cashOnDelivery"
            WWallet.balance = variable;

            console.log(variable);

            await user.save();
            await WWallet.save();
            console.log(tprice);
        } else {
            order.set({ acceptReturn: true });
        }

        await order.save();

        res.redirect('/admin/OrderManagement');
    } catch (error) {
        console.error('Error:', error);
        return res.status(500).json({ success: false, message: 'Internal server error' });
    }
};




const rejectreturn = async (req, res) => {
    const orderId = req.body.orderId;

    try {
         const order = await Order.findOne({ _id: orderId });
        console.log(order);
        if (!order) {
            return res.status(404).json({ success: false, message: 'Order not found' });
        }

        const user = await collection.findOne({ email: req.session.user });
        console.log(user);

        if (!user) {
            return res.status(401).json({ success: false, message: 'User not authenticated' });
        }

        order.rejectReturn = true;

        await order.save();
        
        res.redirect('/admin/OrderManagement')
    } catch (error) {
        console.error('Error:', error);
        return res.status(500).json({ success: false, message: 'Internal server error' });
    }
}

const getCoupon =async(req,res)=>{
    
    try{ const coupons= await coupon.find()
        console.log(coupons);
    
    
        res.render('admin/Coupons',{coupons})}
        catch(error)
        {
            console.log(error);
            res.json("internal server error")
        }
}


const getaddCoupon =async (req,res)=>{

       res.render("admin/addCoupon")
   
}

const addCoupon = async (req, res) => {
    try {
        console.log("inside coupon controller");
        
        const { couponName, couponValue, maxValue, minValue, expiryDate } = req.body;
        console.log(couponName);
        console.log(maxValue);
        console.log(minValue);
        console.log(expiryDate);
        // Creating  a new coupon document
        const newCoupon = new coupon({
            couponName,
            couponValue,
            maxValue,
            minValue,
            expiryDate,
        });
         
        console.log(newCoupon);
        // Saving  the new coupon to the database
        await newCoupon.save();
        console.log("hai");
        // Redirect to a success page or send a success response
        res.redirect('/admin/coupons'); 
    } catch (error) {
        // Handle errors - You can redirect to an error page or send an error response
        res.status(500).send('Internal Server Error'); // Replace with your error handling logic
    }
};

const viewdetails = async (req, res) => {
    try {
      const orderId = req.params.orderId; // Get orderId from URL parameters
      
      // Find the order by its ID
      const order = await Order.findById(orderId).populate('products.productId').populate('addressId');
      console.log('order is here',order);
      if (!order) {
        return res.status(404).send('Order not found'); // Handle case where order is not found
      }
  
      // Render the EJS template and pass the order data
      res.render('admin/viewdetails', { order });
    } catch (error) {
      console.error(error);
      res.status(500).send('Internal Server Error');
    }
  };



  const sendCategoryOffer = async (req, res) => {
    console.log("hello there");
    

    try {
        const activeCategories = await categoryCollection.find({ isDeleted: false });
        const categories = await categoryCollection.find();
        res.render('admin/categoryoffer', { activeCategories, categories });
    } catch (error) {
        console.error(error);
        res.status(500).send('Internal Server Error');
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

        // Update the prices of the products
        for (const product of products) {
            const updatedPrice = Math.floor(product.price - (product.price * (percentage / 100)));
            product.price = updatedPrice;
            await product.save();
        }

        return res.json({ success: true, message: 'Offer applied successfully' });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ success: false, message: 'Internal Server Error' });
    }
};


 
const deleteCoupon = async (req, res) => {
    try {
        const couponId = req.params.couponId;
        console.log(couponId)
        await coupon.findByIdAndDelete(couponId);
        res.redirect('/admin/coupons'); // Redirect back to the admin page after deletion
    } catch (error) {
        console.error(error);
        res.status(500).send('Internal Server Error');
    }
};

const charts = async (req, res) => {
    try {
        res.render('admin/charts');  
    } catch (error) {
        console.error(error);
        res.status(500).send('Internal Server Error');
    }
};

 

const getbanner = async (req, res) => {
  try {
     
    // const bannerData = await banner.find();
    const bannerData = await banner.find({ isDeleted: false });


    // Render the banners page with bannerData
    res.render('admin/banner', { bannerData });
  } catch (err) {
    console.error("Error is ", err);
    // Render the banners page with an error message or redirect to an error page
    res.render('error', { errorMessage: 'An error occurred' });
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
      res.status(500).send('Internal Server Error');
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
      res.status(500).send('Internal Server Error');
    }
  };

 

module.exports = {
    login,
    loginpost,
    dashboard,
    adminlogout,
    userDetails,
    blockUser,
    unblockUser,
    addproductpost,
    addproduct,
    showProducts,
    updateProduct,
    editProduct,
    categoryManagement,
    addCategory,
    deleteCategory,
    showAddCategoryForm,
    editCategory,
    editCategoryPost,
    toggleProductAvailability,
    showOrderManagement,
    updateOrderStatus,
    acceptreturn,
    rejectreturn,
    getCoupon,
    getaddCoupon,
    addCoupon,
    viewdetails,
    sendCategoryOffer,
    applyOffer,
    deleteCoupon,
    charts,
    chart,
    getbanner,
    addBanner,
    addBannerPost,
    deleteBanner
    

}
