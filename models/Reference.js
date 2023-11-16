const mongoose = require('mongoose');

const referenceSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Collection1',
    required: true,
  },
  referenceCode: {
    type: String,
    required: true,
    unique: true,
  },
  usedBy: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Collection1',
  }],
});

const Reference = mongoose.model('Reference', referenceSchema);

module.exports = Reference;
