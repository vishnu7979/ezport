const mongoose = require('mongoose');

const addressSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'collection1', 
        required: true
    },
    userName: {
        type: String,
        required: true
    },
    street: {
        type: String,
        required: true
    },
    city: {
        type: String,
        required: true
    },
    state: {
        type: String,
        required: true
    },
    zip: {
        type: String,
        required: true
    }
});

const Address = mongoose.model('Address', addressSchema);

module.exports = Address;
