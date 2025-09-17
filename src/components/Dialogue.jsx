// server.js
import express from "express";
import mongoose from "mongoose";
import dotenv from "dotenv";
import cors from "cors";
import path from "path";
import { fileURLToPath } from "url";
import fs from "fs";

// ===== Load environment variables first =====
dotenv.config();

// ===== Directory fix for ES Modules =====
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// ===== Initialize App =====
const app = express();

// ===== Ensure uploads directory exists =====
const uploadsDir = path.join(__dirname, "uploads");
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
  console.log("✅ Created uploads directory:", uploadsDir);
}

// ===== Middleware =====
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use("/uploads", express.static(uploadsDir));

// ===== Import Routes =====
import communityRoutes from "./routes/communityRoutes.js";
import authRoutes from "./routes/auth.js";
import educationRoutes from "./routes/educationRoutes.js";
import reportsRoutes from "./routes/reports.js";
import chatRoutes from "./routes/chatRoutes.js";

// ===== Routes =====
app.use("/api/auth", authRoutes);
app.use("/api/community", communityRoutes);
app.use("/api/education", educationRoutes);
app.use("/api/reports", reportsRoutes);
app.use("/api/chat", chatRoutes);

// ===== Test Email Route =====
app.get("/api/test-email-config", async (req, res) => {
  try {
    const { sendAdminApprovalRequest } = await import("./utils/emailService.js");
    const User = (await import("./models/User.js")).default;

    const superAdmins = await User.find({ role: "super_admin" });

    if (superAdmins.length === 0) {
      return res.status(400).json({
        message: "No super admins found. Please create a super admin first.",
        superAdminsCount: 0,
      });
    }

    const testUser = {
      name: "Test User",
      email: "test@example.com",
      adminRequestReason: "This is a test email request",
      createdAt: new Date(),
      _id: new mongoose.Types.ObjectId(),
    };

    await sendAdminApprovalRequest(testUser, superAdmins);

    res.json({
      message: "Test email sent successfully",
      sentTo: superAdmins.map((admin) => admin.email),
      emailConfig: {
        user: process.env.EMAIL_USER,
        hasPassword: !!process.env.EMAIL_PASS,
        frontendUrl: process.env.FRONTEND_URL,
      },
    });
  } catch (error) {
    console.error("Test email error:", error);
    res.status(500).json({
      message: "Test email failed",
      error: error.message,
      stack: process.env.NODE_ENV === "development" ? error.stack : undefined,
    });
  }
});

// ===== Health Check Route =====
app.get("/api/health", (req, res) => {
  res.json({
    status: "OK",
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || "development",
    uploadsDir: uploadsDir,
    uploadsExists: fs.existsSync(uploadsDir),
  });
});

// ===== Serve frontend in production =====
if (process.env.NODE_ENV === "production") {
  app.use(express.static(path.join(__dirname, "../client/build")));
  app.get("*", (req, res) => {
    res.sendFile(path.join(__dirname, "../client/build/index.html"));
  });
}

// ===== MongoDB Connection =====
mongoose.set("strictQuery", false);

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log("✅ MongoDB connected");
  } catch (err) {
    console.error("❌ MongoDB connection error:", err.message);
    process.exit(1);
  }
};

// ===== Error handling middleware =====
app.use((err, req, res, next) => {
  console.error("❌ Server error:", err.stack);
  res.status(500).json({
    message: "Something went wrong!",
    error:
      process.env.NODE_ENV === "development"
        ? err.message
        : "Internal server error",
  });
});

// ===== 404 Handler =====
app.use((req, res) => {
  res.status(404).json({ message: "Route not found" });
});

// ===== Graceful shutdown =====
process.on("SIGINT", async () => {
  console.log("Shutting down gracefully...");
  await mongoose.connection.close();
  process.exit(0);
});

// ===== Start server =====
const startServer = async () => {
  try {
    await connectDB();

    const PORT = process.env.PORT || 5000;
    app.listen(PORT, () => {
      console.log(`🚀 Server running on http://localhost:${PORT}`);
      console.log(
        `📧 Email service: ${
          process.env.EMAIL_USER ? "Configured" : "Not configured"
        }`
      );
      console.log(`📁 Uploads directory: ${uploadsDir}`);
      console.log(`🌐 Frontend URL: ${process.env.FRONTEND_URL || "Not set"}`);
    });
  } catch (error) {
    console.error("Failed to start server:", error);
    process.exit(1);
  }
};

startServer();
