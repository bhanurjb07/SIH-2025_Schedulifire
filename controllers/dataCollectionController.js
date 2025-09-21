const Batch = require("../models/Batch");
const Course = require("../models/Course");
const Faculty = require("../models/Faculty");
const Room = require("../models/Room");
const Slot = require("../models/Slot");
const Timetable = require("../models/Timetable");

const getAllDataForML = async (req, res) => {
  try {
    const batches = await Batch.find().populate("courses");
    const courses = await Course.find();
    const faculties = await Faculty.find().populate("skills");
    const rooms = await Room.find();
    const slots = await Slot.find();
    const timetables = await Timetable.find();

    res.json({
      batches,
      courses,
      faculties,
      rooms,
      slots,
      timetables,
    });
  } catch (error) {
    console.error("Error fetching data:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

module.exports = { getAllDataForML };
