const User = require('../models/User');
const MeetingOverride = require('../models/MeetingOverride');

const getSettings = async (userId) => {
  const user = await User.findById(userId);
  if (!user) {
    const error = new Error('User not found');
    error.status = 404;
    throw error;
  }
  return {
    defaultMeetingTime: user.defaultMeetingTime,
    reminderSettings: user.reminderSettings
  };
};

const updateDefaultMeetingTime = async (userId, meetingTime) => {
  const user = await User.findByIdAndUpdate(
    userId,
    { defaultMeetingTime: meetingTime },
    { new: true, runValidators: true }
  );
  if (!user) {
    const error = new Error('User not found');
    error.status = 404;
    throw error;
  }
  return user.toJSON();
};

const getMeetingTimeForDate = async (userId, date) => {
  const override = await MeetingOverride.findOne({ userId, date });
  if (override) {
    return { meetingTime: override.meetingTime, isOverride: true };
  }

  const user = await User.findById(userId);
  return { meetingTime: user.defaultMeetingTime, isOverride: false };
};

const setMeetingOverride = async (userId, date, meetingTime) => {
  const override = await MeetingOverride.findOneAndUpdate(
    { userId, date },
    { meetingTime },
    { new: true, upsert: true, runValidators: true }
  );
  return override;
};

const deleteMeetingOverride = async (userId, date) => {
  const override = await MeetingOverride.findOneAndDelete({ userId, date });
  if (!override) {
    const error = new Error('No override found for this date');
    error.status = 404;
    throw error;
  }
  return override;
};

const getMeetingOverrides = async (userId) => {
  const today = new Date().toISOString().split('T')[0];
  return MeetingOverride.find({ userId, date: { $gte: today } }).sort({ date: 1 });
};

const updateReminderSettings = async (userId, settings) => {
  const updateData = {};

  if (settings.enabled !== undefined) {
    updateData['reminderSettings.enabled'] = settings.enabled;
  }
  if (settings.email !== undefined) {
    updateData['reminderSettings.email'] = settings.email;
  }
  if (settings.times !== undefined) {
    updateData['reminderSettings.times'] = settings.times;
  }
  if (settings.timezone !== undefined) {
    updateData.timezone = settings.timezone;
  }

  const user = await User.findById(userId);
  if (!user) {
    const error = new Error('User not found');
    error.status = 404;
    throw error;
  }

  if (!user.timezone && !updateData.timezone) {
    updateData.timezone = 'UTC';
  }

  const updatedUser = await User.findByIdAndUpdate(
    userId,
    { $set: updateData },
    { new: true, runValidators: true }
  );

  return updatedUser.toJSON();
};

module.exports = {
  getSettings,
  updateDefaultMeetingTime,
  getMeetingTimeForDate,
  setMeetingOverride,
  deleteMeetingOverride,
  getMeetingOverrides,
  updateReminderSettings
};

