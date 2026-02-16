const mongoose = require('mongoose');

const meetingOverrideSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  date: {
    type: String,
    required: [true, 'Date is required']
  },
  meetingTime: {
    type: String,
    required: [true, 'Meeting time is required']
  }
}, {
  timestamps: true
});

meetingOverrideSchema.index({ userId: 1, date: 1 }, { unique: true });

module.exports = mongoose.model('MeetingOverride', meetingOverrideSchema);

