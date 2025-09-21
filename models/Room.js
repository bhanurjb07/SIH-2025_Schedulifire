const mongoose = require('mongoose');

const RoomSchema = new mongoose.Schema({
    name: { type: String, unique: true, required: true },
    capacity: Number,
    type: String
});

module.exports = mongoose.model('Room', RoomSchema);
