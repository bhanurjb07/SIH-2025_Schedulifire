const axios = require("axios");
const Batch = require("../models/Batch");
const Faculty = require("../models/Faculty");
const Room = require("../models/Room");
const Slot = require("../models/Slot");
const Course = require("../models/Course");

const generateTimetable = async ({ date, batchIds, slotIds }) => {
  const [batches, allFaculties, allRooms, slots] = await Promise.all([
    Batch.find({ _id: { $in: batchIds } }).populate("courses"),
    Faculty.find().populate("skills"),
    Room.find(),
    Slot.find({ _id: { $in: slotIds } }),
  ]);

  const payload = {
    rooms: allRooms.map((r) => ({
      name: r.name,
      capacity: r.capacity,
      type: r.type,
    })),
    subjects: batches
      .flatMap((b) => b.courses)
      .filter(
        (course, index, self) =>
          index === self.findIndex((c) => c.code === course.code)
      )
      .map((c) => ({
        code: c.code,
        name: c.name,
        hoursPerWeek: 3,
      })),
    faculties: allFaculties.map((f) => ({
      name: f.name,
      specialty: f.skills.length > 0 ? f.skills[0].code : null,
      maxLoadPerWeek: f.maxLoadPerWeek,
    })),
    batches: batches.map((b) => ({
      name: `${b.program} ${b.section}`,
      size: b.size,
    })),
  };

  let response;
  try {
    response = await axios.post("http://localhost:5001/generate", payload);
  } catch (error) {
    console.error(
      "ML Service Request Failed:",
      error.response?.data || error.message
    );
    throw new Error("ML service failed to generate timetable.");
  }

  const candidates = response.data.timetables;
  if (!candidates || !Array.isArray(candidates) || candidates.length === 0) {
    throw new Error("ML service returned no valid timetable candidates.");
  }

  const selectedCandidate = candidates[0];

  const batchMap = new Map();
  batches.forEach((b) => batchMap.set(`${b.program} ${b.section}`, b));

  const roomMap = new Map();
  allRooms.forEach((r) => roomMap.set(r.name, r));

  const facultyMap = new Map();
  allFaculties.forEach((f) => facultyMap.set(f.name, f));

  const subjectMap = new Map();
  batches.forEach((b) =>
    b.courses.forEach((c) => subjectMap.set(c.code, c))
  );

  const slotMap = new Map();
  slots.forEach((s) => slotMap.set(s._id.toString(), s));

  let slotIndex = 0;
  const timetableEntries = [];

  for (const [batchName, schedules] of Object.entries(selectedCandidate)) {
    const batch = batchMap.get(batchName);
    if (!batch) {
      console.warn(`Unknown batch in ML response: ${batchName}`);
      continue;
    }

    for (const sched of schedules) {
      const faculty = facultyMap.get(sched.faculty);
      const room = roomMap.get(sched.room);
      const course = subjectMap.get(sched.subject);

      if (!faculty || !room || !course) {
        console.warn(
          `Mismatch in ML response: faculty/room/course not found`
        );
        continue;
      }

      if (slots.length === 0) {
        throw new Error(
          "Cannot generate timetable entries without any slots."
        );
      }

      const slot = slots[slotIndex % slots.length];
      slotIndex++;

      timetableEntries.push({
        batchId: batch._id,
        courseId: course._id,
        facultyId: faculty._id,
        roomId: room._id,
        slotId: slot._id,
        substituted: false,
        mlScore: 0.95,
      });
    }
  }

  return timetableEntries;
};

module.exports = { generateTimetable };
