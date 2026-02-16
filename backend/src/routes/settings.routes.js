const express = require('express');
const router = express.Router();
const settingsController = require('../controllers/settings.controller');
const validate = require('../middlewares/validate');
const auth = require('../middlewares/auth');
const {
  updateMeetingTimeSchema,
  meetingOverrideSchema,
  updateReminderSchema
} = require('../validators/settings.validator');

router.use(auth);

router.get('/', settingsController.getSettings);

router.put('/meeting-time', validate(updateMeetingTimeSchema), settingsController.updateDefaultMeetingTime);

router.get('/meeting-time/:date', settingsController.getMeetingTimeForDate);

router.post('/meeting-override', validate(meetingOverrideSchema), settingsController.setMeetingOverride);

router.get('/meeting-overrides', settingsController.getMeetingOverrides);

router.delete('/meeting-override/:date', settingsController.deleteMeetingOverride);

router.put('/reminders', validate(updateReminderSchema), settingsController.updateReminderSettings);

module.exports = router;

