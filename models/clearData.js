const mongoose = require('mongoose');
const Course = require('./Course');
const Faculty = require('./Faculty');
const Batch = require('./Batch');
const Room = require('./Room');
const Slot = require('./Slot');
const Timetable = require('./Timetable');
const Absence = require('./Absence');

mongoose.connect('mongodb+srv://nishchal:nishchal@cluster0.4uyua.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0', {
  useNewUrlParser: true,
  useUnifiedTopology: true
});

const clearData = async () => {
  await Course.deleteMany({});
  await Faculty.deleteMany({});
  await Batch.deleteMany({});
  await Room.deleteMany({});
  await Slot.deleteMany({});
  await Timetable.deleteMany({});
  await Absence.deleteMany({});
  console.log('All collections cleared');
  mongoose.disconnect();
};

clearData();
