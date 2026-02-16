const settingsService = require('../services/settings.service');

const getSettings = async (req, res, next) => {
  try {
    const settings = await settingsService.getSettings(req.user.id);
    res.status(200).json(settings);
  } catch (error) {
    next(error);
  }
};

const updateDefaultMeetingTime = async (req, res, next) => {
  try {
    const user = await settingsService.updateDefaultMeetingTime(req.user.id, req.body.defaultMeetingTime);
    res.status(200).json({ message: 'Meeting time updated', defaultMeetingTime: user.defaultMeetingTime });
  } catch (error) {
    next(error);
  }
};

const getMeetingTimeForDate = async (req, res, next) => {
  try {
    const result = await settingsService.getMeetingTimeForDate(req.user.id, req.params.date);
    res.status(200).json(result);
  } catch (error) {
    next(error);
  }
};

const setMeetingOverride = async (req, res, next) => {
  try {
    const override = await settingsService.setMeetingOverride(req.user.id, req.body.date, req.body.meetingTime);
    res.status(200).json(override);
  } catch (error) {
    next(error);
  }
};

const deleteMeetingOverride = async (req, res, next) => {
  try {
    await settingsService.deleteMeetingOverride(req.user.id, req.params.date);
    res.status(200).json({ message: 'Override removed' });
  } catch (error) {
    next(error);
  }
};

const getMeetingOverrides = async (req, res, next) => {
  try {
    const overrides = await settingsService.getMeetingOverrides(req.user.id);
    res.status(200).json(overrides);
  } catch (error) {
    next(error);
  }
};

const updateReminderSettings = async (req, res, next) => {
  try {
    const user = await settingsService.updateReminderSettings(req.user.id, req.body);
    res.status(200).json({ message: 'Reminder settings updated', reminderSettings: user.reminderSettings });
  } catch (error) {
    next(error);
  }
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

