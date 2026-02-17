const cron = require('node-cron');
const User = require('../models/User');
const Entry = require('../models/Entry');
const MeetingOverride = require('../models/MeetingOverride');
const ReminderLog = require('../models/ReminderLog');
const { sendReminderEmail } = require('./email.service');


const getLocalDateTime = (timezone = 'UTC') => {
  const now = new Date();
  const formatter = new Intl.DateTimeFormat('en-US', {
    timeZone: timezone,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    hour12: false
  });

  const parts = formatter.formatToParts(now);
  const dateObj = {};
  parts.forEach(part => {
    dateObj[part.type] = part.value;
  });

  const date = `${dateObj.year}-${dateObj.month}-${dateObj.day}`;
  const time = `${dateObj.hour}:${dateObj.minute}`;

  return { date, time };
};

const checkAndSendReminders = async () => {
  try {

    const users = await User.find({
      'reminderSettings.enabled': true,
      'reminderSettings.times': { $exists: true, $not: { $size: 0 } }
    });

    if (users.length === 0) return;
    const usersByTimezone = new Map();

    for (const user of users) {
      const timezone = user.timezone || 'UTC';
      if (!usersByTimezone.has(timezone)) {
        usersByTimezone.set(timezone, []);
      }
      usersByTimezone.get(timezone).push(user);
    }

    const reminderPromises = [];

    for (const [timezone, timezoneUsers] of usersByTimezone.entries()) {
      const { date: localDate, time: localTime } = getLocalDateTime(timezone);
      const timezoneUserIds = timezoneUsers.map(u => u._id);

      const todayEntries = await Entry.find({
        userId: { $in: timezoneUserIds },
        date: localDate,
        tasks: { $exists: true, $ne: '' }
      });

      const entriesByUser = new Map();
      for (const entry of todayEntries) {
        entriesByUser.set(entry.userId.toString(), entry);
      }

      const todayOverrides = await MeetingOverride.find({
        userId: { $in: timezoneUserIds },
        date: localDate
      });

      const overridesByUser = new Map();
      for (const override of todayOverrides) {
        overridesByUser.set(override.userId.toString(), override);
      }

      const sentRemindersToday = await ReminderLog.find({
        userId: { $in: timezoneUserIds },
        date: localDate
      });

      const sentRemindersSet = new Set(
        sentRemindersToday.map(log => `${log.userId.toString()}-${log.reminderTime}`)
      );

      for (const user of timezoneUsers) {
        const { reminderSettings } = user;
        const userTodayEntry = entriesByUser.get(user._id.toString());
        const userOverride = overridesByUser.get(user._id.toString());

        for (const reminderTime of reminderSettings.times) {
          if (reminderTime !== localTime) continue;

          const trackingKey = `${user._id}-${reminderTime}`;

          if (sentRemindersSet.has(trackingKey)) continue;


          if (userTodayEntry && userTodayEntry.tasks) {

            reminderPromises.push(
              ReminderLog.create({
                userId: user._id,
                reminderTime,
                date: localDate
              }).catch(() => {})
            );
            continue;
          }


          const meetingTime = userOverride ? userOverride.meetingTime : user.defaultMeetingTime;
          const recipientEmail = reminderSettings.email || user.email;

          reminderPromises.push(
            (async () => {
              try {
                await sendReminderEmail(recipientEmail, user.name, meetingTime);
                await ReminderLog.create({
                  userId: user._id,
                  reminderTime,
                  date: localDate
                });
                console.log(
                  `✅ Reminder sent to ${user.name} (${recipientEmail}) at ${localTime} (${timezone})`
                );
              } catch (error) {
                console.error(`❌ Failed to send reminder to ${user.name}:`, error.message);
              }
            })()
          );
        }
      }
    }

    await Promise.all(reminderPromises);
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

