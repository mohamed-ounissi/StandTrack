const entryService = require('../services/entry.service');

const createEntry = async (req, res, next) => {
  try {
    const entry = await entryService.createEntry(req.user.id, req.body);
    res.status(201).json(entry);
  } catch (error) {
    next(error);
  }
};

const getEntries = async (req, res, next) => {
  try {
    const { page, limit, startDate, endDate } = req.query;
    const result = await entryService.getEntries(req.user.id, {
      page: parseInt(page) || 1,
      limit: parseInt(limit) || 20,
      startDate,
      endDate
    });
    res.status(200).json(result);
  } catch (error) {
    next(error);
  }
};

const getEntryByDate = async (req, res, next) => {
  try {
    const entry = await entryService.getEntryByDate(req.user.id, req.params.date);
    if (!entry) {
      return res.status(404).json({ message: 'No entry found for this date' });
    }
    res.status(200).json(entry);
  } catch (error) {
    next(error);
  }
};

const getEntryById = async (req, res, next) => {
  try {
    const entry = await entryService.getEntryById(req.user.id, req.params.id);
    res.status(200).json(entry);
  } catch (error) {
    next(error);
  }
};

const updateEntry = async (req, res, next) => {
  try {
    const entry = await entryService.updateEntry(req.user.id, req.params.id, req.body);
    res.status(200).json(entry);
  } catch (error) {
    next(error);
  }
};

const deleteEntry = async (req, res, next) => {
  try {
    await entryService.deleteEntry(req.user.id, req.params.id);
    res.status(200).json({ message: 'Entry deleted successfully' });
  } catch (error) {
    next(error);
  }
};

const getTodayEntry = async (req, res, next) => {
  try {
    const entry = await entryService.getTodayEntry(req.user.id);
    res.status(200).json(entry);
  } catch (error) {
    next(error);
  }
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


