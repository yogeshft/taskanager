const mongoose = require("mongoose");

const taskSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      Required: [true, "task name is required"],
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
  },
  {
    timestamps: true,
  }
);
// Ensure that the combination of user and title is unique
taskSchema.index({ title: 1, user: 1 }, { unique: true });

const Task = mongoose.model("Task", taskSchema);
module.exports = Task;
