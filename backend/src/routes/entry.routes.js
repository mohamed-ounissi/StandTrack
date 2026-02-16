const express = require('express');
const router = express.Router();
const entryController = require('../controllers/entry.controller');
const validate = require('../middlewares/validate');
const auth = require('../middlewares/auth');
const { createEntrySchema, updateEntrySchema } = require('../validators/entry.validator');

router.use(auth);

router.get('/today', entryController.getTodayEntry);

router.get('/date/:date', entryController.getEntryByDate);

router.get('/', entryController.getEntries);

router.post('/', validate(createEntrySchema), entryController.createEntry);

router.get('/:id', entryController.getEntryById);

router.put('/:id', validate(updateEntrySchema), entryController.updateEntry);

router.delete('/:id', entryController.deleteEntry);

module.exports = router;


