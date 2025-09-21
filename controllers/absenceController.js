const Absence = require("../models/Absence");
const substitutionService = require("../services/substitution");

const markAbsence = async (req, res) => {
  try {
    const { facultyId, date, slotId } = req.body;
    const newAbsence = await Absence.create({ facultyId, date, slotId });

    // Apply substitution logic
    await substitutionService.substituteFaculty(
      newAbsence.facultyId,
      newAbsence.date,
      newAbsence.slotId
    );

    res
      .status(200)
      .json({ message: "Absence marked and substitution process initiated." });
  } catch (error) {
    console.error("Error marking absence:", error);
    res
      .status(500)
      .json({ message: "Error marking absence", error: error.message });
  }
};

module.exports = { markAbsence };
