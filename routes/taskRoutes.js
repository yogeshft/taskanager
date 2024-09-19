const express = require("express");
const router = express.Router();
const {
  createTask,
  getAllTask,
  getTask,
  updateTask,
  deleteTask,
} = require("./../controller/taskController");
const { protect } = require("../controller/authController");

// router.get("/:id", protect, getTask);
// router.get("/", protect, getAllTask);
// router.post("/", protect, createTask);
// router.patch("/:id", protect, updateTask);
// router.delete("/:id", protect, deleteTask);
// module.exports = router;

router.route("/").get(protect, getAllTask).post(protect, createTask);

router
  .route("/:id")
  .get(protect, getTask)
  .patch(protect, updateTask)
  .delete(protect, deleteTask);

module.exports = router;
