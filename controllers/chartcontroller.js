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
  


  const charts = async (req, res) => {
    try {
        res.render('admin/charts');  
    } catch (error) {
        console.error(error);
        res.status(500).send('Internal Server Error');
    }
};

 


  module.exports={
    chart,
    charts,

  }