const cron = require('node-cron');
const User = require('../models/User');
const Entry = require('../models/Entry');
const MeetingOverride = require('../models/MeetingOverride');
const { sendReminderEmail } = require('./email.service');

const sentReminders = new Map();

const resetDailyTracking = () => {
  const today = new Date().toISOString().split('T')[0];
  for (const [key, date] of sentReminders.entries()) {
    if (date !== today) {
      sentReminders.delete(key);
    }
  }
};

const checkAndSendReminders = async () => {
  try {
    const now = new Date();
    const currentTime = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
    const today = now.toISOString().split('T')[0];

    resetDailyTracking();

    const users = await User.find({
      'reminderSettings.enabled': true,
      'reminderSettings.times': { $exists: true, $not: { $size: 0 } }
    });

    for (const user of users) {
      const { reminderSettings } = user;

      for (const reminderTime of reminderSettings.times) {
        if (reminderTime !== currentTime) continue;

        const trackingKey = `${user._id}-${reminderTime}`;
        if (sentReminders.get(trackingKey) === today) continue;

        const todayEntry = await Entry.findOne({ userId: user._id, date: today });
        if (todayEntry && todayEntry.tasks) {
          sentReminders.set(trackingKey, today);
          continue;
        }

        const override = await MeetingOverride.findOne({ userId: user._id, date: today });
        const meetingTime = override ? override.meetingTime : user.defaultMeetingTime;

        const recipientEmail = reminderSettings.email || user.email;

        try {
          await sendReminderEmail(recipientEmail, user.name, meetingTime);
          sentReminders.set(trackingKey, today);
          console.log(`✅ Reminder sent to ${user.name} (${recipientEmail}) at ${currentTime}`);
        } catch (error) {
          console.error(`❌ Failed to send reminder to ${user.name}:`, error.message);
        }
      }
    }
  } catch (error) {
    console.error('❌ Cron job error:', error.message);
  }
};

const startCronJobs = () => {
  cron.schedule('* * * * *', () => {
    checkAndSendReminders();
  });

  console.log('⏰ Reminder cron job started (checking every minute)');
};

module.exports = { startCronJobs };

