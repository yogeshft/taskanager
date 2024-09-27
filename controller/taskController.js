const User = require("../model/userModel");
const Task = require("./../model/taskModel");

const createTask = async (req, res) => {
  try {
    const currentUser = req.user;

    if (!currentUser) {
      return res.status(403).json({
        success: false,
        message: "You are not logged in. Please log in to view tasks.",
      });
    }

    const { title } = req.body;
    const task = await Task.create({
      title,
      user: currentUser._id,
    });
    res.status(200).json({ data: task });
  } catch (error) {
    if (error.code === 11000) {
      // Handle the duplicate key error (when the title and user combination is not unique)
      return res.status(409).json({
        success: false,
        message: "Task with this title already exists for this user.",
      });
    }

    res.status(500).json({
      error: {
        errorStack: error.stack,
        error,
      },
    });
  }
};

const getAllTask = async (req, res) => {
  try {
    const currentUser = req.user;

    if (!currentUser) {
      return res.status(403).json({
        success: false,
        message: "You are not logged in. Please log in to view tasks.",
      });
    }

    // Find tasks that belong to the logged-in user
    const tasks = await Task.find({ user: currentUser._id });

    if (!tasks || tasks.length === 0) {
      return res.status(404).json({
        success: false,
        message: "No tasks found for the current user.",
      });
    }

    res.status(200).json({
      success: true,
      data: tasks,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Something went wrong",
      error: error.stack,
    });
  }
};

const getTask = async (req, res) => {
  try {
    const currentUser = req.user;

    if (!currentUser) {
      return res.status(403).json({
        success: false,
        message: "You are not logged in. Please log in to view the task.",
      });
    }

    const { id } = req.params;

    // Find task that belongs to the current user and by task ID
    const task = await Task.findOne({ _id: id, user: currentUser._id });

    if (!task) {
      return res.status(404).json({
        success: false,
        message: "Task not found or you do not have permission to view it.",
      });
    }

    res.status(200).json({
      success: true,
      data: task,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Something went wrong",
      error: error.stack,
    });
  }
};

// update task
const updateTask = async (req, res) => {
  try {
    const currentUser = req.user;

    if (!currentUser) {
      return res.status(403).json({
        success: false,
        message: "You are not logged in. Please log in to update the task.",
      });
    }

    const { id } = req.params;
    const { title } = req.body;

    // Find task that belongs to the current user
    const task = await Task.findOne({ _id: id, user: currentUser._id });

    if (!task) {
      return res.status(404).json({
        success: false,
        message: "Task not found or you do not have permission to update it.",
      });
    }

    // Update the task title
    task.title = title;
    await task.save();

    res.status(200).json({
      success: true,
      data: task,
    });
  } catch (error) {
    if (error.code === 11000) {
      // Handle the duplicate key error (when the title and user combination is not unique)
      return res.status(409).json({
        success: false,
        message: "Task with this title already exists for this user.",
      });
    }

    res.status(500).json({
      success: false,
      message: "Something went wrong",
      error: error.stack,
    });
  }
};

// delete
const deleteTask = async (req, res) => {
  try {
    const currentUser = req.user;

    if (!currentUser) {
      return res.status(403).json({
        success: false,
        message: "You are not logged in. Please log in to delete the task.",
      });
    }

    const { id } = req.params;

    // Find task that belongs to the current user
    const task = await Task.findOne({ _id: id, user: currentUser._id });

    if (!task) {
      return res.status(404).json({
        success: false,
        message: "Task not found or you do not have permission to delete it.",
      });
    }

    // Delete the task
    await Task.findByIdAndDelete(id);

    res.status(200).json({
      success: true,
      message: "Task deleted successfully",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Something went wrong",
      error: error.stack,
    });
  }
};

module.exports = { createTask, getAllTask, getTask, updateTask, deleteTask };
