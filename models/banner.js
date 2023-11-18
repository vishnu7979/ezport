 
const mongoose = require('mongoose');

const bannerSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        unique: true
    },

    image:{
        type:String,
        required:true,
    },

    description:{
        type:String,
        required:true,
    },

    isDeleted: {
        type: Boolean,
        default: false
    }
});

const banner = mongoose.model('banner', bannerSchema);
module.exports = banner;
