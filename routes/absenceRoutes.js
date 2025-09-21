const express = require('express');
const { markAbsence } = require('../controllers/absenceController');
const router = express.Router();
router.post('/mark', markAbsence);

module.exports = router;
