const express = require('express');
const { generate, getTimetable } = require('../controllers/timetableController');
const router = express.Router();

router.post('/generate', generate);
router.get('/:date', getTimetable);

module.exports = router;
