const mongoose = require('mongoose');

const transactionSchema = new mongoose.Schema({
  amount: {
    type: Number,
    required: true,
  },
  type: {
    type: String,
    enum: ['Credit', 'Debit'],
    required: true,
  },
  date: {
    type: Date,
    default: Date.now,
  },
});

const WalletSchema = new mongoose.Schema({
  balance: {
    type: Number,
    default: 0,
  },
  transactions: [transactionSchema],
});

const Wallet = mongoose.model('Wallet', WalletSchema);

module.exports = Wallet;