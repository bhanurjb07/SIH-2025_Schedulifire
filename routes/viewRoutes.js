const express = require("express");
const router = express.Router();
const {
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
} = require("../controllers/viewController");

// Home page
router.get("/", renderHome);

// Course
router.route("/add-course").get(renderCourseForm).post(handleAddCourse);

// Faculty
router.route("/add-faculty").get(renderFacultyForm).post(handleAddFaculty);

// Batch
router.route("/add-batch").get(renderBatchForm).post(handleAddBatch);

// Slot
router.route("/add-slot").get(renderSlotForm).post(handleAddSlot);

// Room
router.route("/add-room").get(renderRoomForm).post(handleAddRoom);

// Absence
router.route("/mark-absence").get(renderAbsenceForm).post(handleMarkAbsence);

// Timetable Generation
router
  .route("/generate-timetable")
  .get(renderGenerateTimetable)
  .post(generateTimetable);

module.exports = router;
