const express = require("express");
const cors = require("cors");
const morgan = require("morgan");
const path = require("path");
const fileUpload = require("express-fileupload");
require("dotenv").config();

const authRoutes = require("./routes/authRoutes");
const ticketRoutes = require("./routes/ticketRoutes");
const technicianRoutes = require("./routes/technicianRoutes");
const loadRoutes = require("./routes/loadRoutes");
const loadRequestRoutes = require("./routes/loadRequestRoutes");
const customerRoutes = require("./routes/customerRoutes");
const troubleshootRoutes = require("./routes/troubleshootRoutes");
const notificationRoutes = require("./routes/notificationRoutes");

const app = express();
const PORT = process.env.PORT || 5000;

/*
|--------------------------------------------------------------------------
| Render proxy configuration
|--------------------------------------------------------------------------
*/
app.set("trust proxy", 1);

/*
|--------------------------------------------------------------------------
| CORS configuration
|--------------------------------------------------------------------------
*/
const allowedOrigins = [
  "http://localhost:5173",
  "http://127.0.0.1:5173",
  process.env.FRONTEND_URL,
].filter(Boolean);

app.use(
  cors({
    origin(origin, callback) {
      // Allow requests without an Origin header, such as Postman,
      // Render health checks, mobile apps, and server-to-server requests.
      if (!origin) {
        return callback(null, true);
      }

      if (allowedOrigins.includes(origin)) {
        return callback(null, true);
      }

      console.warn(`Blocked by CORS: ${origin}`);

      return callback(
        new Error("This origin is not allowed by the CORS policy.")
      );
    },
    credentials: true,
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: [
      "Content-Type",
      "Authorization",
      "X-Requested-With",
    ],
  })
);

/*
|--------------------------------------------------------------------------
| Request logging and body parsers
|--------------------------------------------------------------------------
*/
app.use(morgan(process.env.NODE_ENV === "production" ? "combined" : "dev"));

app.use(
  express.json({
    limit: "15mb",
  })
);

app.use(
  express.urlencoded({
    extended: true,
    limit: "15mb",
  })
);

/*
|--------------------------------------------------------------------------
| File uploads
|--------------------------------------------------------------------------
*/
app.use(
  fileUpload({
    useTempFiles: true,
    tempFileDir: "/tmp/",
    createParentPath: true,
    limits: {
      fileSize: 15 * 1024 * 1024,
    },
    abortOnLimit: true,
    safeFileNames: true,
    preserveExtension: true,
  })
);

/*
|--------------------------------------------------------------------------
| Static uploaded files
|--------------------------------------------------------------------------
*/
app.use(
  "/uploads/messages",
  express.static(path.join(__dirname, "uploads", "messages"))
);

/*
|--------------------------------------------------------------------------
| Health-check routes
|--------------------------------------------------------------------------
*/
app.get("/", (req, res) => {
  return res.status(200).json({
    success: true,
    message: "Cignal Care API is running.",
  });
});

app.get("/api/health", (req, res) => {
  return res.status(200).json({
    success: true,
    status: "healthy",
    environment: process.env.NODE_ENV || "development",
    timestamp: new Date().toISOString(),
  });
});

/*
|--------------------------------------------------------------------------
| API routes
|--------------------------------------------------------------------------
*/
app.use("/api/auth", authRoutes);
app.use("/api/tickets", ticketRoutes);
app.use("/api/technicians", technicianRoutes);
app.use("/api/load", loadRoutes);
app.use("/api/load-requests", loadRequestRoutes);
app.use("/api/customers", customerRoutes);
app.use("/api/troubleshoot", troubleshootRoutes);
app.use("/api/notifications", notificationRoutes);

/*
|--------------------------------------------------------------------------
| 404 handler
|--------------------------------------------------------------------------
*/
app.use((req, res) => {
  return res.status(404).json({
    success: false,
    error: "Endpoint not found",
    method: req.method,
    path: req.originalUrl,
  });
});

/*
|--------------------------------------------------------------------------
| Global error handler
|--------------------------------------------------------------------------
*/
app.use((err, req, res, next) => {
  console.error("GLOBAL SERVER ERROR:", err);

  if (err.message?.includes("CORS")) {
    return res.status(403).json({
      success: false,
      error: "CORS request blocked",
    });
  }

  if (err.code === "LIMIT_FILE_SIZE") {
    return res.status(413).json({
      success: false,
      error: "Uploaded file is too large. Maximum size is 15 MB.",
    });
  }

  return res.status(err.status || 500).json({
    success: false,
    error:
      process.env.NODE_ENV === "production"
        ? "Internal server error"
        : err.message,
  });
});

/*
|--------------------------------------------------------------------------
| Start server
|--------------------------------------------------------------------------
*/
app.listen(PORT, "0.0.0.0", () => {
  console.log(`Server running on port ${PORT}`);
  console.log(
    `Frontend URL: ${process.env.FRONTEND_URL || "Not configured"}`
  );
});