const mongoose = require("mongoose");

const cartItemSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "collection1",  
    required: true,
  },

  productId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Product",
    required: true,
  },
  
  quantity: {
    type: Number,
    required: true,
    default: 1,
  },
 
});

const CartItem = mongoose.model("CartItem", cartItemSchema);

module.exports = CartItem;
