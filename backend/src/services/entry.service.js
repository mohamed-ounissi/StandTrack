const Entry = require('../models/Entry');

const createEntry = async (userId, data) => {
  const existing = await Entry.findOne({ userId, date: data.date });
  if (existing) {
    const error = new Error('Entry already exists for this date. Use update instead.');
    error.status = 409;
    throw error;
  }

  const entry = new Entry({ userId, ...data });
  await entry.save();
  return entry;
};

const getEntries = async (userId, { page = 1, limit = 20, startDate, endDate } = {}) => {
  const query = { userId };

  if (startDate || endDate) {
    query.date = {};
    if (startDate) query.date.$gte = startDate;
    if (endDate) query.date.$lte = endDate;
  }

  const skip = (page - 1) * limit;

  const [entries, total] = await Promise.all([
    Entry.find(query).sort({ date: -1 }).skip(skip).limit(limit),
    Entry.countDocuments(query)
  ]);

  return {
    entries,
    pagination: {
      page,
      limit,
      total,
      pages: Math.ceil(total / limit)
    }
  };
};

const getEntryByDate = async (userId, date) => {
  const entry = await Entry.findOne({ userId, date });
  return entry;
};

const getEntryById = async (userId, entryId) => {
  const entry = await Entry.findOne({ _id: entryId, userId });
  if (!entry) {
    const error = new Error('Entry not found');
    error.status = 404;
    throw error;
  }
  return entry;
};

const updateEntry = async (userId, entryId, data) => {
  const entry = await Entry.findOneAndUpdate(
    { _id: entryId, userId },
    { $set: data },
    { new: true, runValidators: true }
  );

  if (!entry) {
    const error = new Error('Entry not found');
    error.status = 404;
    throw error;
  }

  return entry;
};

const deleteEntry = async (userId, entryId) => {
  const entry = await Entry.findOneAndDelete({ _id: entryId, userId });

  if (!entry) {
    const error = new Error('Entry not found');
    error.status = 404;
    throw error;
  }

  return entry;
};

const getTodayEntry = async (userId) => {
  const today = new Date().toISOString().split('T')[0];
  return Entry.findOne({ userId, date: today });
};

module.exports = {
  createEntry,
  getEntries,
  getEntryByDate,
  getEntryById,
  updateEntry,
  deleteEntry,
  getTodayEntry
};


