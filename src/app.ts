import express, { Application, Request, Response, NextFunction } from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import dotenv from "dotenv";
import path from "path";
import connectDB from "./config/database";

// Import routes
import authRoutes from './routes/authRoutes';
// import taskRoutes from './routes/taskRoutes';

// Import middleware
import { generalLimiter, authLimiter } from './middleware/rateLimiter';
// Load environment variables
dotenv.config({
  path: path.resolve(__dirname, "../.env"),
  debug: true,
  quiet: true,
});

// Connect to database
connectDB();



const app: Application = express();
const port = process.env.PORT || 5000;

// Trust proxy (important for rate limiting in production)
app.set('trust proxy', 1);

// Middleware
app.use(helmet()); // Security headers
app.use(cors()); // Enable CORS
app.use(morgan("combined")); // Logging
// Rate limiting
app.use(generalLimiter);
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));


// Health check
app.get("/health", (req: Request, res: Response) => {
  res.status(200).json({
    success: true,
    message: "Server is running successfully",
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: process.env.NODE_ENV || "development",
  });
});

// API routes
app.use('/api/auth', authLimiter, authRoutes);


app.get("/", (req: Request, res: Response) => {
  res.send("Hello from TypeScript Express!");
});

// API documentation route
app.get('/api', (req: Request, res: Response) => {
  res.json({
    success: true,
    message: 'Task Management API',
    version: '1.0.0',
    endpoints: {
      auth: {
        register: 'POST /api/auth/register',
        login: 'POST /api/auth/login',
        // profile: 'GET /api/auth/profile',
        // updateProfile: 'PUT /api/auth/profile',
        // changePassword: 'PUT /api/auth/change-password'
      },
      tasks: {
        getTasks: 'GET /api/tasks',
        getTask: 'GET /api/tasks/:id',
        createTask: 'POST /api/tasks',
        updateTask: 'PUT /api/tasks/:id',
        deleteTask: 'DELETE /api/tasks/:id',
        toggleTask: 'PATCH /api/tasks/:id/toggle',
        getStats: 'GET /api/tasks/stats'
      }
    },
    documentation: 'Visit /api for endpoint details'
  });
});



// 404 handler
app.use("all", (req: Request, res: Response) => {
  res.status(404).json({
    success: false,
    message: "Route not found",
  });
});

// Global error handler
app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
  console.error("Error:", err.message);
  console.error("Stack:", err.stack);

  res.status(500).json({
    success: false,
    message: "Internal server error",
    ...(process.env.NODE_ENV === "development" && { error: err.message }),
  });
});

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});


export default app;