const mongoose = require('mongoose');

const FacultySchema = new mongoose.Schema({
    name: String,
    skills: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Course' }], // Array of course IDs
    maxLoadPerWeek: Number
});

module.exports = mongoose.model('Faculty', FacultySchema);
