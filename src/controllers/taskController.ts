import { Response } from "express";
import Task from "../models/Task";
import { AuthRequest } from "../middleware/auth";

// @desc    Get all tasks for authenticated user
// @route   GET /api/tasks
// @access  Private
export const getTasks = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  if (!req.user) {
    res.status(401).json({
      success: false,
      message: "User not found",
    });
    return;
  }

  const { completed, priority, search, page = 1, limit = 10 } = req.query;

  //build filter object
  let filter: any = { user: req.user.id };

  if (completed !== undefined) {
    filter.completed = completed === "true";
  }

  if (priority) {
    filter.priority = priority;
  }

  if (search && typeof search === "string") {
    filter.$or = [
      { title: { $regex: search, $options: "i" } },
      { description: { $regex: search, $options: "i" } },
    ];
  }

  // Pagination
  const pageNum = parseInt(page as string);
  const limitNum = parseInt(limit as string);
  const skip = (pageNum - 1) * limitNum;

  // Get tasks with pagination
  const tasks = await Task.find(filter)
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limitNum)
    .populate("user", "name email");

  // Get total count for pagination
  const total = await Task.countDocuments(filter);

  res.json({
    success: true,
    data: {
      tasks,
      pagination: {
        current: pageNum,
        pages: Math.ceil(total / limitNum),
        total,
        limit: limitNum,
      },
    },
  });
};

// @desc    Create new task
// @route   POST /api/tasks
// @access  Private

export const createTask = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({
        success: false,
        message: "User not found",
      });
      return;
    }

    const { title, description, priority, dueDate } = req.body;

    const task = await Task.create({
      title,
      description,
      priority,
      dueDate,
      user: req.user.id,
    });
    // Populate user information
    await task.populate("user", "name email");

    res.status(201).json({
      success: true,
      message: "Task created successfully",
      data: { task },
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: "Server error while creating task",
    });
  }
};

// @desc    Update task
// @route   PUT /api/tasks/:id
// @access  Private

export const updateTask = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({
        success: false,
        message: "User not found",
      });
      return;
    }

    const { title, description, priority, dueDate } = req.body;

    const task = await Task.findOneAndUpdate(
      {
        _id: req.params.id,
        user: req.user.id,
      },
      {
        title,
        description,
        priority,
        dueDate,
      },
      {
        runValidators: true,
        new: true,
      }
    ).populate("user", "name email");

    if (!task) {
      res.status(404).json({
        success: false,
        message: "Task not found",
      });
      return;
    }

    res.json({
      success: true,
      message: "Task updated successfully",
      data: { task },
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: "Server error while updating task",
    });
  }
};

// @desc    Delete task
// @route   DELETE /api/tasks/:id
// @access  Private

export const deleteTask = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({
        success: false,
        message: "User not found",
      });
      return;
    }

    const task = await Task.findByIdAndDelete({
      _id: req.params.id,
      user: req.user.id,
    });

    if (!task) {
      res.status(404).json({
        success: false,
        message: "Task not found",
      });
      return;
    }

    res.json({
      success: true,
      message: "Task deleted successfully",
      data: { task },
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: "Server error while deleting task",
    });
  }
};

// @desc    Get single task
// @route   GET /api/tasks/:id
// @access  Private
export const getTask = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({
        success: false,
        message: "User not found",
      });
      return;
    }

    const task = await Task.findOne({
      _id: req.params.id,
      user: req.user._id,
    }).populate("user", "name email");

    if (!task) {
      res.status(404).json({
        success: false,
        message: "Task not found",
      });
      return;
    }

    res.json({
      success: true,
      data: { task },
    });
  } catch (error) {
    console.error("Get task error:", error);
    res.status(500).json({
      success: false,
      message: "Server error while fetching task",
    });
  }
};

// @desc    Toggle task completion
// @route   PATCH /api/tasks/:id/toggle
// @access  Private

export const toggleTaskCompletion = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({
        success: false,
        message: "User not found",
      });
      return;
    }

    const task = await Task.findOne({
      _id: req.params.id,
      user: req.user.id,
    });

    if (!task) {
      res.status(404).json({
        success: false,
        message: "Task not found",
      });
      return;
    }

    task.completed = !task.completed;

    await task.save();

    // Populate user information
    await task.populate("user", "name email");

    res.status(200).json({
      success: true,
      message: `Task marked as ${task.completed ? "completed" : "incomplete"}`,
      data: {
        task,
      },
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: "Server error while toggling task",
    });
  }
};

// @desc    Get task statistics
// @route   GET /api/tasks/stats
// @access  Private
export const getTaskStats = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({
        success: false,
        message: "User not found",
      });
      return;
    }

    // Get counts
    const totalCompletedTasks = await Task.countDocuments({
      completed: true,
      user: req.user.id,
    });
    const totalIncompletedTasks = await Task.countDocuments({
      completed: false,
      user: req.user.id,
    });

    res.status(200).json({
      success: true,
      message: "tasks stats fetched successfully",
      data: {
        totalCompletedTasks,
        totalIncompletedTasks,
        totalTasks: totalCompletedTasks + totalIncompletedTasks,
      },
    });
  } catch (error) {
    console.error(error)
    res.status(500).json({
      success: false,
      message: "Server error while loading tasks stats",
    });
  }
};
