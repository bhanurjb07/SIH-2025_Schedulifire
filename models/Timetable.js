const mongoose = require('mongoose');

const TimetableEntrySchema = new mongoose.Schema({
    batchId: { type: mongoose.Schema.Types.ObjectId, ref: 'Batch' },
    courseId: { type: mongoose.Schema.Types.ObjectId, ref: 'Course' },
    facultyId: { type: mongoose.Schema.Types.ObjectId, ref: 'Faculty' },
    roomId: { type: mongoose.Schema.Types.ObjectId, ref: 'Room' },
    slotId: { type: mongoose.Schema.Types.ObjectId, ref: 'Slot' },
    substituted: { type: Boolean, default: false },
    mlScore: { type: Number, default: 0 }
});

const TimetableSchema = new mongoose.Schema({
    date: { type: Date, required: true, unique: true },
    entries: [TimetableEntrySchema],
});

module.exports = mongoose.model('Timetable', TimetableSchema);
