const mongoose = require('mongoose');

const AbsenceSchema = new mongoose.Schema({
    facultyId: mongoose.Schema.Types.ObjectId,
    date: Date, // Changed from String to Date for proper date handling
    slotId: mongoose.Schema.Types.ObjectId
});

module.exports = mongoose.model('Absence', AbsenceSchema);
