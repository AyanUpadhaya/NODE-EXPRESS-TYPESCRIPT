import express, { Application, Request, Response, NextFunction } from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import dotenv from "dotenv";
// Load environment variables
dotenv.config();

// Types
interface Task {
  id: string;
  title: string;
  description: string;
  completed: boolean;
  createdAt: Date;
  updatedAt: Date;
}

interface CreateTaskRequest {
  title: string;
  description?: string;
}

interface UpdateTaskRequest {
  title?: string;
  description?: string;
  completed?: boolean;
}

// In-memory storage (replace with database in production)
let tasks: Task[] = [];
let taskIdCounter = 1;

const app: Application = express();
const port = process.env.PORT || 5000;

// Middleware
app.use(helmet()); // Security headers
app.use(cors()); // Enable CORS
app.use(morgan('combined')); // Logging
app.use(express.json()); // Parse JSON bodies
app.use(express.urlencoded({ extended: true })); // Parse URL-encoded bodies

// Utility functions
const generateId = (): string => (taskIdCounter++).toString();

const findTaskById = (id: string): Task | undefined => {
  return tasks.find(task => task.id === id);
};

// Routes

// Health check
app.get('/health', (req: Request, res: Response) => {
  res.status(200).json({ 
    status: 'OK', 
    timestamp: new Date().toISOString(),
    uptime: process.uptime()
  });
});

// Get all tasks
app.get('/api/tasks', (req: Request, res: Response) => {
  const { completed, search } = req.query;
  
  let filteredTasks = [...tasks];
  
  // Filter by completion status
  if (completed !== undefined) {
    const isCompleted = completed === 'true';
    filteredTasks = filteredTasks.filter(task => task.completed === isCompleted);
  }
  
  // Search in title and description
  if (search && typeof search === 'string') {
    const searchTerm = search.toLowerCase();
    filteredTasks = filteredTasks.filter(task =>
      task.title.toLowerCase().includes(searchTerm) ||
      task.description.toLowerCase().includes(searchTerm)
    );
  }
  
  res.json({
    success: true,
    data: filteredTasks,
    count: filteredTasks.length
  });
});

// Get single task
app.get('/api/tasks/:id', (req: Request, res: Response) => {
  const { id } = req.params;
  const task = findTaskById(id);
  
  if (!task) {
    return res.status(404).json({
      success: false,
      message: 'Task not found'
    });
  }
  
  res.json({
    success: true,
    data: task
  });
});

// Create new task
app.post('/api/tasks', (req: Request<{}, {}, CreateTaskRequest>, res: Response) => {
  const { title, description = '' } = req.body;
  
  if (!title || title.trim() === '') {
    return res.status(400).json({
      success: false,
      message: 'Title is required'
    });
  }
  
  const newTask: Task = {
    id: generateId(),
    title: title.trim(),
    description: description.trim(),
    completed: false,
    createdAt: new Date(),
    updatedAt: new Date()
  };
  
  tasks.push(newTask);
  
  res.status(201).json({
    success: true,
    data: newTask,
    message: 'Task created successfully'
  });
});

// Update task
app.put('/api/tasks/:id', (req: Request<{ id: string }, {}, UpdateTaskRequest>, res: Response) => {
  const { id } = req.params;
  const { title, description, completed } = req.body;
  
  const taskIndex = tasks.findIndex(task => task.id === id);
  
  if (taskIndex === -1) {
    return res.status(404).json({
      success: false,
      message: 'Task not found'
    });
  }
  
  const existingTask = tasks[taskIndex];
  
  // Update fields if provided
  if (title !== undefined) {
    if (title.trim() === '') {
      return res.status(400).json({
        success: false,
        message: 'Title cannot be empty'
      });
    }
    existingTask.title = title.trim();
  }
  
  if (description !== undefined) {
    existingTask.description = description.trim();
  }
  
  if (completed !== undefined) {
    existingTask.completed = completed;
  }
  
  existingTask.updatedAt = new Date();
  
  res.json({
    success: true,
    data: existingTask,
    message: 'Task updated successfully'
  });
});

// Delete task
app.delete('/api/tasks/:id', (req: Request, res: Response) => {
  const { id } = req.params;
  const taskIndex = tasks.findIndex(task => task.id === id);
  
  if (taskIndex === -1) {
    return res.status(404).json({
      success: false,
      message: 'Task not found'
    });
  }
  
  const deletedTask = tasks.splice(taskIndex, 1)[0];
  
  res.json({
    success: true,
    data: deletedTask,
    message: 'Task deleted successfully'
  });
});

// Toggle task completion
app.patch('/api/tasks/:id/toggle', (req: Request, res: Response) => {
  const { id } = req.params;
  const task = findTaskById(id);
  
  if (!task) {
    return res.status(404).json({
      success: false,
      message: 'Task not found'
    });
  }
  
  task.completed = !task.completed;
  task.updatedAt = new Date();
  
  res.json({
    success: true,
    data: task,
    message: `Task marked as ${task.completed ? 'completed' : 'incomplete'}`
  });
});

app.get("/", (req: Request, res: Response) => {
  res.send("Hello from TypeScript Express!");
});
// 404 handler
app.use('all', (req: Request, res: Response) => {
  res.status(404).json({
    success: false,
    message: 'Route not found'
  });
});


// Global error handler
app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
  console.error('Error:', err.message);
  console.error('Stack:', err.stack);
  
  res.status(500).json({
    success: false,
    message: 'Internal server error',
    ...(process.env.NODE_ENV === 'development' && { error: err.message })
  });
});



app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
