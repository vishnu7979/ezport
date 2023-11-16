const mongoose = require('mongoose');

const ProductSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    description: {
        type: String,
        required: true
    },
    price: {
        type: Number,
        required: true
    },
    category: {
        type: String,
        required: true
    },
    image: {
            type: String,  
        required: true
    },

    quantity:{
        type: Number,
        required: true
    },
    additionalImages: {
        type: [String],
        required: true
    },
    
    isDeleted: {
         type: Boolean,
          default: false 
    },
    offer:{
        type:Number,
         
    }

});

const Product = mongoose.model('Product', ProductSchema);

module.exports = Product;


