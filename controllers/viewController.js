const scheduler = require("../services/scheduler");
const Batch = require("../models/Batch");
const Course = require("../models/Course");
const Faculty = require("../models/Faculty");
const Room = require("../models/Room");
const Slot = require("../models/Slot");
const Absence = require("../models/Absence"); // Assuming this model exists

// --- Route Handlers ---

const renderHome = (req, res) => {
  // Assuming index.ejs will also use the new layout
  res.render("index", { title: "Home" });
};

// Generic function to render a form view
const renderForm = (viewName, title) => (req, res) => {
  res.render(viewName, { title });
};

// Generic function to handle a form submission for creating a new entity
const handleForm = (Model, redirectUrl) => async (req, res, next) => {
  try {
    await Model.create(req.body);
    res.redirect(redirectUrl);
  } catch (err) {
    // Pass error to the global error handler
    err.message = `Failed to add item. ${err.message}`;
    next(err);
  }
};

const renderCourseForm = renderForm("add-course", "Add Course");
const handleAddCourse = handleForm(Course, "/");

const renderFacultyForm = async (req, res, next) => {
  try {
    const courses = await Course.find().sort({ name: 1 });
    res.render("add-faculty", {
      title: "Add Faculty",
      courses: courses,
    });
  } catch (err) {
    next(err);
  }
};
const handleAddFaculty = handleForm(Faculty, "/");

const renderBatchForm = renderForm("add-batch", "Add Batch");
const handleAddBatch = handleForm(Batch, "/");

const renderSlotForm = renderForm("add-slot", "Add Slot");
const handleAddSlot = handleForm(Slot, "/");

const renderRoomForm = renderForm("add-room", "Add Room");
const handleAddRoom = handleForm(Room, "/");

const renderAbsenceForm = async (req, res, next) => {
  try {
    // Fetch data for dropdowns
    const [faculties, slots] = await Promise.all([
      Faculty.find().sort({ name: 1 }),
      Slot.find().sort({ dayOfWeek: 1, startTime: 1 }),
    ]);
    res.render("mark-absence", {
      title: "Mark Absence",
      faculties,
      slots,
    });
  } catch (err) {
    next(err);
  }
};

const handleMarkAbsence = async (req, res, next) => {
  try {
    await Absence.create(req.body);
    res.redirect("/");
  } catch (err) {
    err.message = `Failed to mark absence. ${err.message}`;
    next(err);
  }
};

const renderGenerateTimetable = async (req, res, next) => {
  try {
    // Fetch all batches and slots to display in the form
    const [batches, slots] = await Promise.all([
      Batch.find().sort({ program: 1, section: 1 }),
      Slot.find().sort({ dayOfWeek: 1, startTime: 1 }),
    ]);
    res.render("generate-timetable", {
      title: "Generate Timetable",
      batches, // Pass batches to the view
      slots, // Pass slots to the view
      timetable: null,
      error: null,
    });
  } catch (err) {
    next(err);
  }
};

const generateTimetable = async (req, res, next) => {
  try {
    // Fetch form data first, as it's needed for re-rendering in all cases
    const [formBatches, formSlots] = await Promise.all([
      Batch.find().sort({ program: 1, section: 1 }),
      Slot.find().sort({ dayOfWeek: 1, startTime: 1 }),
    ]);

    // Ensure IDs are always in an array format, even if only one is sent
    const rawTimetable = await scheduler.generateTimetable({
      date: req.body.date,
      batchIds: [].concat(req.body.batchIds || []),
      slotIds: [].concat(req.body.slotIds || []),
    });

    if (!rawTimetable || rawTimetable.length === 0) {
      return res.render("generate-timetable", {
        title: "Generate Timetable",
        batches: formBatches,
        slots: formSlots,
        timetable: [],
        error: "No entries were generated.",
      });
    }

    // Fetch only the required data in bulk, directly from the database
    const [batches, courses, faculties, rooms, slots] = await Promise.all([
      Batch.find({
        _id: { $in: [...new Set(rawTimetable.map((e) => e.batchId))] },
      }),
      Course.find({
        _id: { $in: [...new Set(rawTimetable.map((e) => e.courseId))] },
      }),
      Faculty.find({
        _id: { $in: [...new Set(rawTimetable.map((e) => e.facultyId))] },
      }),
      Room.find({
        _id: { $in: [...new Set(rawTimetable.map((e) => e.roomId))] },
      }),
      Slot.find({
        _id: { $in: [...new Set(rawTimetable.map((e) => e.slotId))] },
      }),
    ]);

    // Create maps for efficient O(1) lookups
    const batchMap = new Map(batches.map((i) => [i._id.toString(), i]));
    const courseMap = new Map(courses.map((i) => [i._id.toString(), i]));
    const facultyMap = new Map(faculties.map((i) => [i._id.toString(), i]));
    const roomMap = new Map(rooms.map((i) => [i._id.toString(), i]));
    const slotMap = new Map(slots.map((i) => [i._id.toString(), i]));

    const detailedEntries = rawTimetable.map((entry) => {
      const batch = batchMap.get(entry.batchId.toString());
      const course = courseMap.get(entry.courseId.toString());
      const faculty = facultyMap.get(entry.facultyId.toString());
      const room = roomMap.get(entry.roomId.toString());
      const slot = slotMap.get(entry.slotId.toString());

      // Gracefully handle if any related data is missing
      if (!batch || !course || !faculty || !room || !slot) {
        return {
          batchName: "Unknown",
          courseName: "Unknown",
          facultyName: "Unknown",
          roomName: "Unknown",
          slotTime: "Unknown Time",
        };
      }

      return {
        batchName: `${batch.program} ${batch.section}`,
        courseName: course.name,
        facultyName: faculty.name,
        roomName: room.name,
        slotTime: `${slot.dayOfWeek} ${slot.startTime} - ${slot.endTime}`,
      };
    });

    res.render("generate-timetable", {
      title: "Generated Timetable",
      batches: formBatches,
      slots: formSlots,
      timetable: detailedEntries,
      error: null,
    });
  } catch (err) {
    next(err);
  }
};

module.exports = {
  renderHome,
  renderCourseForm,
  handleAddCourse,
  renderFacultyForm,
  handleAddFaculty,
  renderBatchForm,
  handleAddBatch,
  renderSlotForm,
  handleAddSlot,
  renderRoomForm,
  handleAddRoom,
  renderAbsenceForm,
  handleMarkAbsence,
  renderGenerateTimetable,
  generateTimetable,
};
