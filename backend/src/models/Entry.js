const mongoose = require('mongoose');

const entrySchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  date: {
    type: String,
    required: [true, 'Date is required']
  },
  tasks: {
    type: String,
    default: ''
  },
  nextTasks: {
    type: String,
    default: ''
  },
  blockers: {
    type: String,
    default: ''
  },
  questions: {
    type: String,
    default: ''
  },
  notes: {
    type: String,
    default: ''
  }
}, {
  timestamps: true
});

entrySchema.index({ userId: 1, date: 1 }, { unique: true });

module.exports = mongoose.model('Entry', entrySchema);
