import { Router } from "express";
import {
  getTasks,
  getTask,
  createTask,
  updateTask,
  deleteTask,
  toggleTaskCompletion,
  getTaskStats,
} from "../controllers/taskController";
import { protect } from "../middleware/auth";
import {
  createTaskValidation,
  updateTaskValidation,
  taskIdValidation,
  taskQueryValidation,
} from "../middleware/validation";

const router = Router();

// All routes require authentication
router.use(protect);

// Task statistics route (must come before /:id route)
router.get("/stats", getTaskStats);

// Task CRUD routes
router
  .route("/")
  .get(taskQueryValidation, getTasks)
  .post(createTaskValidation, createTask);

router
  .route("/:id")
  .get(taskIdValidation, getTask)
  .put(taskIdValidation, updateTaskValidation, updateTask)
  .delete(taskIdValidation, deleteTask);

// Toggle task completion
router.patch("/:id/toggle", taskIdValidation, toggleTaskCompletion);

export default router;
