const mongoose = require('mongoose');

const SlotSchema = new mongoose.Schema({
    dayOfWeek: String,
    startTime: String,
    endTime: String,
});

module.exports = mongoose.model('Slot', SlotSchema);
