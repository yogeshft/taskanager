const express = require("express");
const taskRoutes = require("./routes/taskRoutes");
const userRoutes = require("./routes/userRoutes");
const morgan = require("morgan");
const cookieParser = require("cookie-parser");
const cors = require("cors");
const app = express();
const corsOptions = {
  origin: "http://localhost:5173", // your frontend origin
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"], // allowed methods
  allowedHeaders: ["Content-Type", "Authorization"], // allowed headers
  credentials: true, // allow credentials (cookies, authorization headers)
};
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(morgan("dev"));
app.use(cors(corsOptions));
app.use(cookieParser());

app.use("/api/v1/task", taskRoutes);
app.use("/api/v1/user", userRoutes);

module.exports = app;
