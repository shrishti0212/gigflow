import express from "express";
import mongoose from "mongoose";
import dotenv from "dotenv";
import cookieParser from "cookie-parser";
import { createServer } from "http";
import { Server } from "socket.io";
import cors from "cors";

import authRoutes from "./routes/authRoutes.js";
import gigRoutes from "./routes/gigRoutes.js";
import bidRoutes from "./routes/bidRoutes.js";

// Load environment variables FIRST
dotenv.config();

console.log("🚀 Starting GigFlow Backend...");
console.log("📝 Environment Check:");
console.log("- PORT:", process.env.PORT || 5000);
console.log("- NODE_ENV:", process.env.NODE_ENV || "development");
console.log("- MONGO_URI:", process.env.MONGO_URI ? "✅ Present" : "❌ Missing");
console.log("- JWT_SECRET:", process.env.JWT_SECRET ? "✅ Present" : "❌ Missing");

// Validate environment variables
if (!process.env.MONGO_URI) {
  console.error("❌ FATAL: MONGO_URI is required");
  process.exit(1);
}
if (!process.env.JWT_SECRET) {
  console.error("❌ FATAL: JWT_SECRET is required");
  process.exit(1);
}

const app = express();
const PORT = process.env.PORT || 5000;

// Allowed origins for CORS
const allowedOrigins = [
  "http://localhost:5173",
  "http://localhost:5174",
  "http://localhost:3000",
  "https://gigflow-henna.vercel.app"
];

console.log("🔐 CORS Origins:", allowedOrigins);

// CORS configuration - FIXED FOR PATCH METHOD
const corsOptions = {
  origin: function (origin, callback) {
    // Allow requests with no origin (like mobile apps or curl)
    if (!origin) {
      console.log("✅ Request with no origin allowed");
      return callback(null, true);
    }
    
    if (allowedOrigins.includes(origin)) {
      console.log("✅ CORS allowed for:", origin);
      callback(null, true);
    } else {
      console.log("❌ CORS blocked for:", origin);
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization", "Cookie"],
  exposedHeaders: ["Set-Cookie"],
  preflightContinue: false,
  optionsSuccessStatus: 204
};

// Apply middleware
app.use(cors(corsOptions));

// CRITICAL: Handle preflight for ALL routes BEFORE other routes
app.options("*", cors(corsOptions));
app.use(cookieParser());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Request logger
app.use((req, res, next) => {
  console.log(`📨 ${req.method} ${req.path}`, {
    origin: req.headers.origin || "no-origin",
    hasAuth: !!req.cookies?.token
  });
  next();
});

// Explicit preflight handler for ALL routes (must be BEFORE routes)
app.use((req, res, next) => {
  if (req.method === 'OPTIONS') {
    res.header('Access-Control-Allow-Origin', req.headers.origin);
    res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, PATCH, DELETE, OPTIONS');
    res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization, Cookie');
    res.header('Access-Control-Allow-Credentials', 'true');
    res.header('Access-Control-Max-Age', '86400'); // 24 hours
    return res.status(204).end();
  }
  next();
});

// Health check - BEFORE other routes
app.get("/", (req, res) => {
  res.json({
    status: "🚀 GigFlow Backend Running",
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || "development"
  });
});

app.get("/health", (req, res) => {
  res.json({
    status: "healthy",
    timestamp: new Date().toISOString(),
    mongodb: mongoose.connection.readyState === 1 ? "connected" : "disconnected",
    cors: allowedOrigins
  });
});

// API Routes
app.use("/api/auth", authRoutes);
app.use("/api/gigs", gigRoutes);
app.use("/api/bids", bidRoutes);

// 404 handler for unmatched routes
app.use((req, res) => {
  console.log("❌ 404 Not Found:", req.method, req.path);
  res.status(404).json({ 
    message: `Route ${req.method} ${req.path} not found`,
    availableRoutes: [
      "GET /",
      "GET /health",
      "POST /api/auth/register",
      "POST /api/auth/login",
      "GET /api/gigs",
      "POST /api/gigs"
    ]
  });
});

// Global error handler
app.use((err, req, res, next) => {
  console.error("❌ Server Error:", err.message);
  console.error(err.stack);
  res.status(err.status || 500).json({ 
    message: err.message || "Internal server error",
    error: process.env.NODE_ENV === "development" ? err.stack : undefined
  });
});

// Socket.io Setup
const httpServer = createServer(app);

const io = new Server(httpServer, {
  cors: {
    origin: allowedOrigins,
    credentials: true,
    methods: ["GET", "POST"]
  },
  transports: ["websocket", "polling"]
});

io.on("connection", (socket) => {
  console.log("✅ Socket connected:", socket.id);

  socket.on("join", (userId) => {
    if (!userId) {
      console.log("⚠️ Join attempt without userId");
      return;
    }
    socket.join(userId);
    console.log(`👤 User ${userId} joined room`);
  });
  
  socket.on("disconnect", () => {
    console.log("❌ Socket disconnected:", socket.id);
  });

  socket.on("error", (error) => {
    console.error("❌ Socket error:", error);
  });
});

app.set("io", io);

// Database connection and server start
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => {
    console.log("✅ MongoDB connected successfully");
    
    httpServer.listen(PORT, () => {
      console.log("=".repeat(50));
      console.log("🚀 SERVER STARTED SUCCESSFULLY");
      console.log("=".repeat(50));
      console.log(`📡 Port: ${PORT}`);
      console.log(`🌍 Environment: ${process.env.NODE_ENV || 'development'}`);
      console.log(`🔐 CORS Origins: ${allowedOrigins.join(", ")}`);
      console.log("=".repeat(50));
    });
  })
  .catch((err) => {
    console.error("❌ FATAL: MongoDB Connection Error:", err.message);
    console.error(err.stack);
    process.exit(1);
  });

// Graceful shutdown
process.on("SIGTERM", () => {
  console.log("⚠️ SIGTERM received, shutting down gracefully");
  httpServer.close(() => {
    console.log("✅ Server closed");
    mongoose.connection.close(false, () => {
      console.log("✅ MongoDB connection closed");
      process.exit(0);
    });
  });
});

process.on("unhandledRejection", (err) => {
  console.error("❌ Unhandled Promise Rejection:", err);
  process.exit(1);
});

process.on("uncaughtException", (err) => {
  console.error("❌ Uncaught Exception:", err);
  process.exit(1);
});