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


const showOrderManagement = async (req, res) => {
    try {
        const order = await Order.find().populate('products.productId').populate("userId")
        
        // Check if any order has been returned
        const hasReturnedOrder = order.some(order => order.isReturned);

        if (!Order) {
            throw new Error('No orders found');
        }

        res.render('admin/orderManagement', { order, hasReturnedOrder });
    } catch (error) {
        console.error("error");
        res.render('admin/404')
    }
};





const viewdetails = async (req, res) => {
    try {
      const orderId = req.params.orderId; // Get orderId from URL parameters
      
      // Find the order by its ID
      const order = await Order.findById(orderId).populate('products.productId').populate('addressId');
      if (!order) {
        return res.status(404).send('Order not found'); // Handle case where order is not found
      }
  
      // Render the EJS template and pass the order data
      res.render('admin/viewdetails', { order });
    } catch (error) {
      console.error(error);
      res.render('admin/404')
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
        res.render('admin/404')
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
        res.render('admin/404')
    }
};




const showOrderConfirmationAll = async (req, res) => {
    try {
  
       const user = await collection.findOne({ email: req.session.user });
      req.session.userDetails = user;
  
      const cartItems = await CartItem.find({ userId: user._id }).populate(
        "productId"
      );
      req.session.productDetails = cartItems;
      const products = cartItems.map((item) => ({
        productId: item.productId,
        quantity: item.quantity,
      }));
  
      const address = await Address.find({ userId: user._id });
      const totalPrice = req.session.totalPrice;
      const grandTotal=totalPrice;
      const coupons = await coupon.find({ appliedUsers: { $nin: [user._id] } });
  
      // Check if cartItems is empty
      if (cartItems.length === 0) {
        // Redirect to cart page with alert message
        return res.redirect("/cart?alert=emptyCart");
      }
      
      const grantTotal = totalPrice;

      res.render("user/orderConfirmAll", {
        user,
        products,
        totalPrice,
        address,
        coupons,
        grantTotal,
      });
    } catch (error) {
      console.log(error);
      res.render('error') 
   }
  };
  
  const getUserOrders = async (req, res) => {
    try {
      if (req.session.user) {
        console.log("here i am ");
        const user = await collection.findOne({ email: req.session.user });
        const userId = user._id;
        const orders = await Order.find({ userId }).populate(
          "products.productId"
        );
        console.log(orders);
        orders.sort((a, b) => b.orderDate - a.orderDate);
  
        res.render("user/myorders", { orders });
      } else {
        res.redirect("/login");
      }
    } catch (error) {
      console.error(error);
      res.render('error') 
    }
  };
  

  //user section starts--------------------------------------------------------------------------------------------->



  const downloadInvoice=async (req, res) => {
    try {
      console.log("inside download invoice");
      const orderId = req.params.orderId;
      console.log("order is is:",orderId);
      const order = await Order.findById(orderId).populate('userId').populate('addressId').populate('products.productId');
       console.log("invoice order is :",order);
      if (!order) {
        return res.status(404).json({ error: 'Order not found' });
       
      }
  
      res.json(order);
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Internal Server Error' });
    }
  };




const feedback = (req, res) => {
    const orderId = req.params.orderId;
  
    const order = {
      orderId: orderId,
    };
  
    res.render("user/feedback", { order });
    
  };
  

  
const confirm = (req, res) => {
    res.render("user/confirm");
  };




const getMyReturnsPage = async (req, res) => {
    try {
      const user = await collection.findOne({ email: req.session.user });
      const returnedOrders = await Order.find({
        userId: user._id,
        isReturned: true,
      });
      console.log(returnedOrders);
      res.render("user/MyReturns", { returnedOrders });
    } catch (error) {
      console.error(error);
      res.render('error') 
    }
  };
  



const cancelOrder = async (req, res) => {
    const orderId = req.params.id;
    console.log("id of the order to cancel", orderId);
  
    try {
      const order = await Order.findById(orderId);
  
      if (!order) {
        throw new Error("Order not found");
      }
      if (req.method === 'POST') {
        const cancelReason = req.body.cancelReason;
        
        order.cancelReason = cancelReason;
    }
      // Loop through the products in the order
      for (const productInfo of order.products) {
        const productId = productInfo.productId;
        const quantity = productInfo.quantity;
  
        // Find the product and update the quantity
        const product = await Product.findById(productId);
  
        if (!product) {
          throw new Error(`Product with ID ${productId} not found`);
        }
  
         product.quantity += quantity;
        await product.save();
      }
  
       order.status = "Canceled";
      await order.save();
  
      const user = await collection
        .findOne({ email: req.session.user })
        .populate("wallet");
  
      if (user) {
        const totalPrice = order.totalPrice;
  
        if (user.wallet) {
          if (order.paymentMethod !== 'cashOnDelivery') {
             user.wallet.transactions.push({
              amount: totalPrice,
              type: 'Credit',
            });
  
             user.wallet.balance += totalPrice;
            await user.wallet.save();
          }
        } else {
          const newWallet = new Wallet({ balance: totalPrice });
           newWallet.transactions.push({
            amount: totalPrice,
            type: 'Credit',
          });
  
          await newWallet.save();
          user.wallet = newWallet;
        }
  
        await user.save();
      }
  
  
      res.redirect("/myorders");
    } catch (err) {
      console.log(err);
      res.render('error')
    }
  };


const orderdetails = async (req, res) => {
    try {
      const orderId = req.params.orderId; // Get orderId from URL parameters
  
      // Find the order by its ID
      const order = await Order.findById(orderId)
        .populate("products.productId")
        .populate("addressId");
      console.log(order);
      if (!order) {
        return res.status(404).send("Order not found");  
      }
  
       res.render("user/orderdetails", { order });
    } catch (error) {
      console.error(error);
      res.render('error')
    }
  };
  

  const returnOrder = async (req, res) => {
    const orderId = req.params.id;
    console.log(orderId);
  
    try {
        const order = await Order.findById(orderId);
  
        if (!order) {
            return res.status(404).json({ message: "Order not found" });
        }
  
        // If it's a POST request, update order with return reason
        if (req.method === 'POST') {
            const returnReason = req.body.returnReason;
            // Validate and handle return reason as needed
  
            // Update order with return reason
            order.returnReason = returnReason;
        }
  
        // Update order status to 'Returned'
        order.isReturned = true;
        await order.save();
  
        res.redirect("/myorders");
    } catch (error) {
      res.render('error') 
    }
  };
  


// function for generating oderId with prefix "ODR"
function generateOrderId() {
    const prefix = 'ODR_';
    const randomNumbers = Math.floor(1000 + Math.random() * 9000); // Generate a random 4-digit number
    const orderId = `${prefix}${randomNumbers}`;
    return orderId;
  }
  
  
  let order;
  
  const processOrder = async (req, res) => {
    try {
      console.log("inside the processOrder function");
      const user = await collection
        .findOne({ email: req.session.user })
        .populate("wallet");
      const userId = user._id;
  
      const { address, paymentMethod, totalPrice, grantTotal, couponDiscount } =
        req.body;
  
      console.log(grantTotal);
      console.log(couponDiscount);
  
      const cartItems = await CartItem.find({ userId: user._id }).populate(
        "productId"
      );
  
      const products = cartItems.map((item) => ({
        productId: item.productId,
        quantity: item.quantity,
      }));
  
  
      const orderId = generateOrderId()
      console.log("the coustome orderId is :",orderId);
      
      order = new Order({
        orderId,
        userId,
        paymentMethod,
        addressId: address,
        products,
        totalPrice,
        grantTotal,
        couponDiscount,
      });
  
      if (paymentMethod === "netBanking") {
        var instance = new Razorpay({
          key_id: secret_Id,
          key_secret: secret_Key,
        });
  
        var options = {
          amount: Math.round(grantTotal * 100), // amount in paise (smallest currency unit)
          currency: "INR",
          receipt: "order_rcptid_11",
        };
  
        instance.orders.create(options, function (err, order) {
          if (err) {
            console.error("Razorpay order creation error:", err);
            res
              .status(500)
              .json({ success: false, message: "Error creating Razorpay order" });
          } else {
            res.json({
              id: order.id,
              amount: order.amount,
              currency: order.currency,
            });
          }
        });
      } else if (paymentMethod == "cashOnDelivery") {
        await order.save();
  
        const cartItems = await CartItem.find({ userId: user._id }).populate(
          "productId"
        );
  
        const products = cartItems.map((item) => ({
          productId: item.productId,
          quantity: item.quantity,
        }));
  
        for (const productInfo of products) {
          const productId = productInfo.productId;
          const quantity = productInfo.quantity;
  
          // Find the product and update the quantity
          const product = await Product.findById(productId);
          console.log(productId);
  
          if (!product) {
            throw new Error(`Product with ID ${productId} not found`);
          }
  
          // Update the quantity of the product
          product.quantity -= quantity;
          await product.save();
        }
  
        await CartItem.deleteMany({ userId: user._id });
  
        await CartItem.deleteMany({ userId: user._id });
        res.json({ success: true, redirectUrl: "/confirm" });
      } 
      
      else if (paymentMethod === "wallet") {
  
        console.log('hello inside wallet');
      
        if (order.grantTotal <= user.wallet.balance) {
          await order.save();
          const transactionAmount = -grantTotal; // Debit from the wallet
          const transactionType = 'Debit';
      
          // Update the wallet balance
          user.wallet.balance -= grantTotal;
      
          // Add a new transaction to the 'transactions' array
          user.wallet.transactions.push({
            amount: transactionAmount,
            type: transactionType,
          });
      
          // Save the changes to the wallet
          await user.wallet.save();
  
          const cartItems = await CartItem.find({ userId: user._id }).populate(
            "productId"
          );
  
          const products = cartItems.map((item) => ({
            productId: item.productId,
            quantity: item.quantity,
          }));
  
          for (const productInfo of products) {
            const productId = productInfo.productId;
            const quantity = productInfo.quantity;
  
            // Find the product and update the quantity
            const product = await Product.findById(productId);
            console.log(productId);
  
            if (!product) {
              throw new Error(`Product with ID ${productId} not found`);
            }
  
            // Update the quantity of the product
            product.quantity -= quantity;
            await product.save();
          }
  
          await CartItem.deleteMany({ userId: user._id });
  console.log("above confirm");
          res.json({ success: true, redirectUrl: "/confirm" });
        } else {
          console.log("inside else");
          // res.json("insufficient balance");
          return res.redirect("/orderConfirmAll")
        }
      }
    } catch (error) {
      console.error("Error:", error);
      res
        .status(500)
        .json({
          success: false,
          message: "An error occurred while processing the order",
        });
    }
  };
  
  
  
  const saveOrder = async (req, res) => {
    console.log("the order is :", order);
    await order.save();
   
    console.log("order saved and cart is emptyed");
   
    const user = await collection.findOne({ email: req.session.user });
  
    console.log("user is :", user);
  
    const cartItems = await CartItem.find({ userId: user._id }).populate(
      "productId"
    );
  
    const products = cartItems.map((item) => ({
      productId: item.productId,
      quantity: item.quantity,
    }));
  
    for (const productInfo of products) {
      const productId = productInfo.productId;
      const quantity = productInfo.quantity; 
      const product = await Product.findById(productId);
      console.log(productId);
  
      if (!product) {
        throw new Error(`Product with ID ${productId} not found`);
      }
      
      // Update the quantity of the product
      product.quantity -= quantity;
      await product.save();
    }
  
    await CartItem.deleteMany({ userId: user._id });
    res.redirect("/confirm");
  };
  
  
  
  

module.exports={
    showOrderManagement,
    updateOrderStatus,
    viewdetails,
    acceptreturn,
    rejectreturn,
    toggleProductAvailability,
    getUserOrders,
    showOrderConfirmationAll,
    downloadInvoice,
    feedback,
    confirm,
    getMyReturnsPage,
    cancelOrder,
    orderdetails,
    returnOrder,
    saveOrder,
    processOrder

}