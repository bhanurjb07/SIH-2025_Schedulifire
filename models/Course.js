const mongoose = require('mongoose');

const CourseSchema = new mongoose.Schema({
    code: String,
    name: String,
    credits: Number
});

module.exports = mongoose.model('Course', CourseSchema);
