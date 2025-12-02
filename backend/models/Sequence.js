const mongoose = require('mongoose');

const SequenceSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    length: { type: Number, required: true },
    gcContent: { type: Number, required: true }
  },
  { timestamps: true }
);

module.exports = mongoose.model('Sequence', SequenceSchema);