 

const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Collection1',
    required: true
  },
  paymentMethod: {
    type: String,
    enum: ['wallet', 'netBanking', 'cashOnDelivery'],  
    required: true
  },
  addressId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Address',
    required: true
  },
  products: [
    {
      productId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Product',
        required: true
      },
      quantity: {
        type: Number,
        default:1
      }
    }
  ],
  totalPrice: {
    type: Number,
    required: true
  },
  orderDate: {
    type: Date,
    default: Date.now
  },
  status: {
    type: String,
    enum: ['Pending', 'Shipped', 'Canceled','Delivered'],
    default:'Pending'  
   },
   
   isReturned:{
    type:Boolean,
    default:false
   },

   acceptReturn:{
    type:Boolean,
    default:false
    },

    rejectReturn:{
    type:Boolean,
    default:false
    },
    grantTotal:{
      type: Number,
     },
    couponDiscount:{
      type: Number
     },
     cancelReason: {
      type: String,
      },
      returnReason: {
        type: String,
    }


      
});

const Order = mongoose.model('Order', orderSchema);

module.exports = Order;
