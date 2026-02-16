const Joi = require('joi');

const createEntrySchema = Joi.object({
  date: Joi.string().pattern(/^\d{4}-\d{2}-\d{2}$/).required().messages({
    'string.pattern.base': 'Date must be in YYYY-MM-DD format',
    'any.required': 'Date is required'
  }),
  tasks: Joi.string().allow('').max(5000).optional(),
  nextTasks: Joi.string().allow('').max(5000).optional(),
  blockers: Joi.string().allow('').max(5000).optional(),
  questions: Joi.string().allow('').max(5000).optional(),
  notes: Joi.string().allow('').max(5000).optional()
});

const updateEntrySchema = Joi.object({
  tasks: Joi.string().allow('').max(5000).optional(),
  nextTasks: Joi.string().allow('').max(5000).optional(),
  blockers: Joi.string().allow('').max(5000).optional(),
  questions: Joi.string().allow('').max(5000).optional(),
  notes: Joi.string().allow('').max(5000).optional()
}).min(1);

module.exports = { createEntrySchema, updateEntrySchema };
