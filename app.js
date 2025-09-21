const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
require("dotenv").config();
const path = require("path");

const dataRoutes = require("./routes/dataRoutes");
const timetableRoutes = require("./routes/timetableRoutes");
const absenceRoutes = require("./routes/absenceRoutes");
const dataCollectionRoutes = require("./routes/dataCollectionRoutes");
const viewRoutes = require("./routes/viewRoutes");

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));
app.use(express.static(path.join(__dirname, "public")));
app.use(cors());
app.use(express.json()); // for parsing application/json
app.use(express.urlencoded({ extended: true })); // for parsing application/x-www-form-urlencoded

// MongoDB Connection
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log("MongoDB connected"))
  .catch((err) => console.error("MongoDB connection error:", err));

// Routes
app.use("/", viewRoutes);
app.use("/api/data", dataRoutes);
app.use("/api/timetable", timetableRoutes);
app.use("/api/absence", absenceRoutes);
app.use("/api/ml", dataCollectionRoutes);

// 404 Not Found Handler - must be after all other routes
app.use((req, res, next) => {
  res.status(404).render("error", {
    error: {
      status: 404,
      message: "Page Not Found",
    },
    title: "Error 404",
  });
});

// Global Error Handler - must be the last piece of middleware
app.use((err, req, res, next) => {
  const statusCode = err.statusCode || 500;
  console.error(err.stack); // Log the full error for debugging
  res.status(statusCode).render("error", {
    error: {
      status: statusCode,
      message: err.message || "Something went wrong on the server.",
      stack: process.env.NODE_ENV === "development" ? err.stack : null,
    },
    title: `Error ${statusCode}`,
  });
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
