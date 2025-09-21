const { generateTimetable } = require("../services/scheduler");
const Timetable = require("../models/Timetable");

const generate = async (req, res) => {
  try {
    const timetableEntries = await generateTimetable(req.body);

    const entriesArray = Array.isArray(timetableEntries)
      ? timetableEntries
      : [timetableEntries];

    const formattedEntries = entriesArray.map((e) => ({
      batchId: e.batchId,
      courseId: e.courseId,
      facultyId: e.facultyId,
      roomId: e.roomId,
      slotId: e.slotId,
      substituted: e.substituted,
      mlScore: e.mlScore,
    }));

    // Ensure we send both date and entriesfgf
    const updatedTimetable = await Timetable.findOneAndUpdate(
      { date: req.body.date },
      { date: req.body.date, entries: formattedEntries },
      { new: true, upsert: true, runValidators: true }
    );

    res.status(201).json(updatedTimetable);
  } catch (error) {
    console.error("Error generating or saving timetable:", error);
    res.status(500).json({
      message: "Error generating or saving timetable",
      error: error.message,
    });
  }
};
const getTimetable = async (req, res) => {
  try {
    const timetable = await Timetable.findOne({ date: req.params.date });
    if (!timetable) {
      return res.status(404).json({ message: "No timetable found for this date." });
    }
    res.status(200).json(timetable);
  } catch (error) {
    console.error("Error fetching timetable:", error);
    res.status(500).json({ message: "Error fetching timetable", error: error.message });
  }
};

module.exports = { generate, getTimetable };
