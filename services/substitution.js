const Timetable = require("../models/Timetable");
const Faculty = require("../models/Faculty");

const substituteFaculty = async (absentFacultyId, date, slotId) => {
  try {
    console.log(
      `Starting substitution for faculty ${absentFacultyId} on ${date} at slot ${slotId}`
    );

    // Find the timetable for the given date
    const timetable = await Timetable.findOne({ date: date });

    if (!timetable) {
      console.log(`No timetable found for date: ${date}`);
      return;
    }

    // Find the specific entry that needs substitution
    const entryToSubstitute = timetable.entries.find(
      (entry) =>
        entry.facultyId.equals(absentFacultyId) && entry.slotId.equals(slotId)
    );

    if (!entryToSubstitute) {
      console.log(
        "No specific entry found within the timetable for substitution."
      );
      return;
    }

    // Find all faculties who have the required skill and are not the absent one
    const courseId = entryToSubstitute.courseId;
    const potentialSubstitutes = await Faculty.find({
      _id: { $ne: absentFacultyId }, // Exclude the absent faculty
      skills: courseId, // Faculty must have the skill for the course
    });

    // Get a list of all faculties already busy in that specific slot
    const busyFacultyIds = new Set(
      timetable.entries
        .filter((entry) => entry.slotId.equals(slotId))
        .map((entry) => entry.facultyId.toString())
    );

    // Filter the potential substitutes to find who is actually available
    const availableSubstitutes = potentialSubstitutes.filter(
      (faculty) => !busyFacultyIds.has(faculty._id.toString())
    );

    let bestSubstitute = null;
    if (availableSubstitutes.length > 0) {
      // This is where ML would rank and select the best one. For now, we just pick the first.
      bestSubstitute = availableSubstitutes[0];
    }

    if (bestSubstitute) {
      console.log(
        `Substituting ${absentFacultyId} with ${bestSubstitute._id} for course ${courseId}`
      );
      entryToSubstitute.facultyId = bestSubstitute._id;
      entryToSubstitute.substituted = true;
      await timetable.save();
      console.log("Timetable updated successfully.");
    } else {
      console.log("No available substitute found for the slot.");
    }
  } catch (error) {
    console.error("Error during faculty substitution:", error);
    throw error; // Re-throw the error to be caught by the controller
  }
};
module.exports = { substituteFaculty };
