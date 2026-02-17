const cron = require('node-cron');
const User = require('../models/User');
const Entry = require('../models/Entry');
const MeetingOverride = require('../models/MeetingOverride');
const ReminderLog = require('../models/ReminderLog');
const { sendReminderEmail } = require('./email.service');

const getTimeInTimezone = (timezone) => {
  const now = new Date();
  const formatter = new Intl.DateTimeFormat('en-US', {
    timeZone: timezone,
    hour: '2-digit',
    minute: '2-digit',
    hour12: false
  });
  return formatter.format(now);
};


const getDateInTimezone = (timezone) => {
  const now = new Date();
  const formatter = new Intl.DateTimeFormat('en-CA', { timeZone: timezone });
  return formatter.format(now);
};

const checkAndSendReminders = async () => {
  try {
    const users = await User.find({
      'reminderSettings.enabled': true,
      'reminderSettings.times': { $exists: true, $not: { $size: 0 } }
    });

    if (users.length === 0) return;

    const userIds = users.map(u => u._id);

    const entries = await Entry.find({
      userId: { $in: userIds },
      tasks: { $exists: true, $ne: '' }
    });
    const entriesByUser = new Map();
    entries.forEach(entry => {
      entriesByUser.set(entry.userId.toString(), entry);
    });

    const overrides = await MeetingOverride.find({ userId: { $in: userIds } });
    const overridesByUser = new Map();
    overrides.forEach(override => {
      const userId = override.userId.toString();
      if (!overridesByUser.has(userId)) {
        overridesByUser.set(userId, []);
      }
      overridesByUser.get(userId).push(override);
    });

    for (const user of users) {
      const timezone = user.timezone || 'UTC';
      const localTime = getTimeInTimezone(timezone);
      const localDate = getDateInTimezone(timezone);
      const { reminderSettings } = user;

      console.log(`[DEBUG] User: ${user.name}, Timezone: ${timezone}, Local time: ${localTime}, Local date: ${localDate}, Reminder times: ${reminderSettings.times.join(', ')}`);

      const sentReminders = await ReminderLog.find({
        userId: user._id,
        date: localDate
      });
      const sentTimes = new Set(sentReminders.map(r => r.reminderTime));
      console.log(`[DEBUG] Already sent reminders today: ${Array.from(sentTimes).join(', ') || 'none'}`);

      for (const reminderTime of reminderSettings.times) {
        console.log(`[DEBUG] Checking reminder time: ${reminderTime} vs current time: ${localTime}`);
        if (reminderTime !== localTime) {
          console.log(`[DEBUG] Time mismatch, skipping`);
          continue;
        }
        if (sentTimes.has(reminderTime)) {
          console.log(`[DEBUG] Already sent today, skipping`);
          continue;
        }

        const userEntry = entriesByUser.get(user._id.toString());
        if (userEntry && userEntry.date === localDate && userEntry.tasks) {
          console.log(`[DEBUG] User already has tasks for today, skipping`);
          await ReminderLog.create({
            userId: user._id,
            reminderTime,
            date: localDate
          }).catch(() => {});
          continue;
        }

        const userOverrides = overridesByUser.get(user._id.toString()) || [];
        const todayOverride = userOverrides.find(o => o.date === localDate);
        const meetingTime = todayOverride ? todayOverride.meetingTime : user.defaultMeetingTime;
        const recipientEmail = reminderSettings.email || user.email;

        console.log(`[DEBUG] Attempting to send reminder to ${recipientEmail}`);
        try {
          const emailResult = await sendReminderEmail(recipientEmail, user.name, meetingTime);
          console.log(`[DEBUG] Email service returned:`, emailResult);
          await ReminderLog.create({
            userId: user._id,
            reminderTime,
            date: localDate
          });
          console.log(`✅ Reminder sent to ${user.name} (${recipientEmail}) at ${localTime} (${timezone})`);
        } catch (error) {
          console.error(`❌ Failed to send reminder to ${user.name}:`, error.message);
          console.error(`[DEBUG] Error details:`, error);
          console.error(error.stack);
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

