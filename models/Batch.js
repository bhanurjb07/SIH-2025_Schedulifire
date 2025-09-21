const mongoose = require('mongoose');

const BatchSchema = new mongoose.Schema({
    program: String,
    section: String,
    size: Number,
    courses: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Course' }] // Add courses field
});

module.exports = mongoose.model('Batch', BatchSchema);
