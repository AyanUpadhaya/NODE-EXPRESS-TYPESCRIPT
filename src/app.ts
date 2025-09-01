import express, { Application, Request, Response, NextFunction } from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import dotenv from "dotenv";
import path from "path";
import connectDB from "./config/database";

// Import routes
import authRoutes from "./routes/authRoutes";
import taskRoutes from "./routes/taskRoutes";

// Import middleware
import { generalLimiter, authLimiter } from "./middleware/rateLimiter";
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
app.set("trust proxy", 1);

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
app.use("/api/auth", authLimiter, authRoutes);
app.use("/api/tasks", taskRoutes);

app.get("/", (req: Request, res: Response) => {
  res.send("Hello from TypeScript Express!");
});

// API documentation route
app.get("/api", (req: Request, res: Response) => {
  res.json({
    success: true,
    message: "Task Management API",
    version: "1.0.0",
    endpoints: {
      auth: {
        register: "POST /api/auth/register",
        login: "POST /api/auth/login",
        profile: "GET /api/auth/profile",
        updateProfile: "PUT /api/auth/profile",
        changePassword: "PUT /api/auth/change-password",
      },
      tasks: {
        getTasks: "GET /api/tasks",
        getTask: "GET /api/tasks/:id",
        createTask: "POST /api/tasks",
        updateTask: "PUT /api/tasks/:id",
        deleteTask: "DELETE /api/tasks/:id",
        toggleTask: "PATCH /api/tasks/:id/toggle",
        getStats: "GET /api/tasks/stats",
      },
    },
    documentation: "Visit /api for endpoint details",
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
  console.error("Error Details:");
  console.error("Message:", err.message);
  console.error("Stack:", err.stack);
  console.error("URL:", req.originalUrl);
  console.error("Method:", req.method);
  console.error("Body:", req.body);
  console.error("Query:", req.query);
  console.error("Params:", req.params);

  // Mongoose validation error
  if (err.name === "ValidationError") {
    const message = Object.values((err as any).errors).map(
      (val: any) => val.message
    );
    res.status(400).json({
      success: false,
      message: "Validation Error",
      errors: message,
    });
    return;
  }

  // Mongoose duplicate key error
  if ((err as any).code === 11000) {
    const field = Object.keys((err as any).keyValue)[0];
    res.status(400).json({
      success: false,
      message: `${field} already exists`,
    });
    return;
  }

  // Mongoose cast error (invalid ObjectId)
  if (err.name === "CastError") {
    res.status(400).json({
      success: false,
      message: "Invalid ID format",
    });
    return;
  }

  // JWT errors
  if (err.name === "JsonWebTokenError") {
    res.status(401).json({
      success: false,
      message: "Invalid token",
    });
    return;
  }

  if (err.name === "TokenExpiredError") {
    res.status(401).json({
      success: false,
      message: "Token expired",
    });
    return;
  }

  // Default error response
  res.status(500).json({
    success: false,
    message: "Internal server error",
    ...(process.env.NODE_ENV === "development" && {
      error: err.message,
      stack: err.stack,
    }),
  });
});

// Graceful shutdown handlers
process.on("SIGTERM", () => {
  console.log("🛑 SIGTERM received. Shutting down gracefully...");
  process.exit(0);
});

process.on("SIGINT", () => {
  console.log("🛑 SIGINT received. Shutting down gracefully...");
  process.exit(0);
});

// Handle unhandled promise rejections
process.on("unhandledRejection", (err: Error) => {
  console.error("❌ Unhandled Promise Rejection:", err.message);
  process.exit(1);
});

// Handle uncaught exceptions
process.on("uncaughtException", (err: Error) => {
  console.error("❌ Uncaught Exception:", err.message);
  process.exit(1);
});

const server = app.listen(port, () => {
  console.log("\n🚀 Task Management API Server Started");
  console.log("=====================================");
  console.log(`📍 Server running on port: ${port}`);
  console.log(`🔗 Base URL: http://localhost:${port}`);
  console.log(`💚 Health check: http://localhost:${port}/health`);
  console.log(`📋 API docs: http://localhost:${port}/api`);
  console.log(`🔐 Auth endpoints: http://localhost:${port}/api/auth`);
  console.log(`✅ Task endpoints: http://localhost:${port}/api/tasks`);
  console.log(`🔧 Environment: ${process.env.NODE_ENV || "development"}`);
  console.log(
    `🗄️  Database: ${process.env.MONGODB_URI ? "Connected" : "Local MongoDB"}`
  );
  console.log("=====================================\n");
});

export default app;
