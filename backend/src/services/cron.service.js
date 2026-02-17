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

    if (users.length === 0) {
      console.log('⏰ [Cron] No users with reminders enabled');
      return;
    }

    console.log(`⏰ [Cron] Checking reminders for ${users.length} user(s)`);
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

      console.log(`⏰ [Cron] Processing timezone ${timezone} - Current time: ${localTime}, Date: ${localDate}`);

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

        console.log(`⏰ [Cron] User: ${user.name}, Reminder times: ${reminderSettings.times.join(', ')}, Timezone: ${timezone}`);

        for (const reminderTime of reminderSettings.times) {
          if (reminderTime !== localTime) {
            console.log(`⏰ [Cron] Skipping ${user.name} - reminder time ${reminderTime} !== current time ${localTime}`);
            continue;
          }

          const trackingKey = `${user._id}-${reminderTime}`;

          if (sentRemindersSet.has(trackingKey)) {
            console.log(`⏰ [Cron] Skipping ${user.name} - reminder already sent today`);
            continue;
          }

          if (userTodayEntry && userTodayEntry.tasks) {
            console.log(`⏰ [Cron] Skipping ${user.name} - already has tasks for today`);
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

          console.log(`⏰ [Cron] Sending reminder to ${user.name} (${recipientEmail}) at ${localTime} (${timezone})`);

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
                console.error(error.stack);
              }
            })()
          );
        }
      }
    }

    await Promise.all(reminderPromises);
  } catch (error) {
    console.error('❌ Cron job error:', error.message);
    console.error(error.stack);
  }
};

const startCronJobs = () => {
  cron.schedule('* * * * *', () => {
    checkAndSendReminders();
  });

  console.log('⏰ Reminder cron job started (checking every minute)');
};

// Manual test function - can be called to test reminders immediately
const testReminders = async () => {
  console.log('🧪 [Test] Manually triggering reminder check...');
  await checkAndSendReminders();
};

module.exports = { startCronJobs, testReminders };

