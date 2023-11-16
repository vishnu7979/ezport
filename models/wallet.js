 
const mongoose = require('mongoose');

const WalletSchema = new mongoose.Schema({
    balance: {
        type: Number,
        default: 0  
    }
     
});
 
const Wallet = mongoose.model("Wallet", WalletSchema);

module.exports = Wallet;

