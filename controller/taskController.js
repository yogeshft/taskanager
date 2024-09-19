const Task = require("./../model/taskModel");

const createTask = async (req, res) => {
  try {
    const { title } = req.body;
    const task = await Task.create({ title });
    res.status(200).json({ data: task });
  } catch (error) {
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
    const task = await Task.find();
    if (!task || !task.length) {
      return res.status(404).json({
        status: "false",
        data: {
          task,
        },
      });
    }
    res.status(200).json({ task });
  } catch (error) {
    res.status(500).json({ status: "false", message: "something went wrong" });
  }
};

const getTask = async (req, res) => {
  try {
    const { id } = req.params;
    const task = await Task.findById(id);
    if (!task) {
      return res.status(404).json({
        status: "false",
        data: task,
      });
    }
    res.status(200).json({ task });
  } catch (error) {
    res
      .status(500)
      .json({
        status: "false",
        message: "something went wrong",
        stack: error.stack,
      });
  }
};

// update task
const updateTask = async (req, res) => {
  try {
    const { id } = req.params;
    const { title } = req.body;
    let foundTask = await Task.findById(id);
    if (!foundTask) {
      return res.status(404).json({
        status: "false",
        data: "not found",
      });
    }
    const updateTask = await Task.findByIdAndUpdate(
      id,
      { title },
      { new: true }
    );
    res.status(200).json({ updateTask });
  } catch (error) {
    res
      .status(500)
      .json({
        status: "false",
        message: "something went wrong",
        stack: error.stack,
      });
  }
};

// delete
const deleteTask = async (req, res) => {
  try {
    const { id } = req.params;
    const task = await Task.findById(id);
    if (!task) {
      return res.status(404).json({
        status: "false",
        data: "not found",
      });
    }
    await Task.findByIdAndDelete(id);
    res
      .status(200)
      .json({ success: true, message: "task deleted successfully" });
  } catch (error) {
    res
      .status(500)
      .json({
        status: "false",
        message: "something went wrong",
        stack: error.stack,
      });
  }
};
module.exports = { createTask, getAllTask, getTask, updateTask, deleteTask };
