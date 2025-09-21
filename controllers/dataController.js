const Batch = require("../models/Batch");
const Course = require("../models/Course");
const Faculty = require("../models/Faculty");
const Room = require("../models/Room");
const Slot = require("../models/Slot");

// A map to dynamically select the correct model based on the URL parameter
const models = {
  batch: Batch,
  course: Course,
  faculty: Faculty,
  room: Room,
  slot: Slot,
};

// Helper function to get a model from an entity name string
const getModel = (entityName) => {
  const model = models[entityName.toLowerCase()];
  if (!model) {
    // This error will be caught by the try...catch block in our route handlers
    throw new Error(`Entity '${entityName}' not found.`);
  }
  return model;
};

/**
 * @desc    Upload bulk data for a specific entity (e.g., faculty, rooms)
 * @route   POST /api/data/upload/:entity
 * @access  Public
 */
exports.uploadData = async (req, res) => {
  try {
    const { entity } = req.params;
    const Model = getModel(entity);

    const dataToUpload = req.body;
    if (!Array.isArray(dataToUpload) || dataToUpload.length === 0) {
      return res.status(400).json({
        success: false,
        error: "Request body must be a non-empty array of data.",
      });
    }

    // Use insertMany for efficient bulk insertion
    const createdData = await Model.insertMany(dataToUpload);

    res
      .status(201)
      .json({ success: true, count: createdData.length, data: createdData });
  } catch (err) {
    res.status(400).json({ success: false, error: err.message });
  }
};

/**
 * @desc    Get all data for a specific entity
 * @route   GET /api/data/:entity
 * @access  Public
 */
exports.getData = async (req, res) => {
  try {
    const { entity } = req.params;
    const Model = getModel(entity);
    const data = await Model.find();
    res.status(200).json({ success: true, count: data.length, data: data });
  } catch (err) {
    res.status(400).json({ success: false, error: err.message });
  }
};

/**
 * @desc    Get a single item for a specific entity by ID
 * @route   GET /api/data/:entity/:id
 * @access  Public
 */
exports.getDataById = async (req, res) => {
  try {
    const { entity, id } = req.params;
    const Model = getModel(entity);
    const item = await Model.findById(id);

    if (!item) {
      return res
        .status(404)
        .json({ success: false, error: `${entity} not found` });
    }

    res.status(200).json({ success: true, data: item });
  } catch (err) {
    // Mongoose's findById can throw a CastError for invalid ID formats
    if (err.name === "CastError") {
      return res
        .status(400)
        .json({
          success: false,
          error: `Invalid ${entity} ID: ${req.params.id}`,
        });
    }
    res.status(400).json({ success: false, error: err.message });
  }
};
