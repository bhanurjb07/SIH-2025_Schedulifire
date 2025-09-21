const express = require("express");
const {
  uploadData,
  getData,
  getDataById,
} = require("../controllers/dataController");
const router = express.Router();

router.post("/upload/:entity", uploadData);
router.get("/:entity/:id", getDataById); // More specific route first
router.get("/:entity", getData);

module.exports = router;
