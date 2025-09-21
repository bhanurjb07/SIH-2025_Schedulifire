const express = require('express');
const router = express.Router();
const { getAllDataForML } = require('../controllers/dataCollectionController');

// Route to send all data for ML
router.get('/all-data', getAllDataForML);

module.exports = router;
