const Joi = require('joi');

const timePattern = /^([01]\d|2[0-3]):([0-5]\d)$/;

const updateMeetingTimeSchema = Joi.object({
  defaultMeetingTime: Joi.string().pattern(timePattern).required().messages({
    'string.pattern.base': 'Meeting time must be in HH:mm format (24h)',
    'any.required': 'Meeting time is required'
  })
});

const meetingOverrideSchema = Joi.object({
  date: Joi.string().pattern(/^\d{4}-\d{2}-\d{2}$/).required().messages({
    'string.pattern.base': 'Date must be in YYYY-MM-DD format',
    'any.required': 'Date is required'
  }),
  meetingTime: Joi.string().pattern(timePattern).required().messages({
    'string.pattern.base': 'Meeting time must be in HH:mm format (24h)',
    'any.required': 'Meeting time is required'
  })
});

const updateReminderSchema = Joi.object({
  enabled: Joi.boolean().required().messages({
    'any.required': 'Enabled flag is required'
  }),
  email: Joi.string().email().allow('').optional().messages({
    'string.email': 'Please provide a valid email'
  }),
  times: Joi.array().items(
    Joi.string().pattern(timePattern).messages({
      'string.pattern.base': 'Each reminder time must be in HH:mm format (24h)'
    })
  ).max(3).optional().messages({
    'array.max': 'Maximum 3 reminder times allowed'
  }),
  timezone: Joi.string().optional().custom((value, helpers) => {
    if (!value) return value;
    try {
      Intl.DateTimeFormat(undefined, { timeZone: value });
      return value;
    } catch {
      return helpers.error('any.invalid');
    }
  }).messages({
    'any.invalid': 'Invalid timezone identifier. Use IANA timezone format (e.g., "Africa/Tunis", "America/New_York")'
  })
});

module.exports = { updateMeetingTimeSchema, meetingOverrideSchema, updateReminderSchema };

