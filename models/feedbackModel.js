 
const mongoose = require('mongoose');

const feedbackSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'collection1',
    required: true
  },
  orderId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Order',  
    required: true
  },
  rating: {
    type: Number,
    required: true
  },
  
  comment: String,

  createdAt: {
    type: Date,
    default: Date.now
  }
});

const Feedback = mongoose.model('Feedback', feedbackSchema);

module.exports = Feedback;


