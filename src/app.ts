import express, { Request, Response, NextFunction } from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import helmet from "helmet";
import hpp from "hpp";
import { ENV } from "@/config/env";
import routes from "@/routes";

const app = express();

// Behind a hosting proxy (Render/Vercel) we need the real client protocol/IP.
app.set("trust proxy", 1);

// FRONTEND_URL may contain several comma-separated origins (e.g. the
// production domain plus Vercel preview domains).
const allowedOrigins = ENV.FRONTEND_URL
  .split(",")
  .map((origin) => origin.trim().replace(/\/$/, ""))
  .filter(Boolean);

// --- Core Middleware ---
app.use(helmet());
app.use(cors({
  origin(origin, callback) {
    // Requests without an Origin header (health checks, curl, server-to-server)
    // are always allowed; browsers only enforce CORS when an Origin is present.
    if (!origin || allowedOrigins.includes(origin.replace(/\/$/, ""))) {
      return callback(null, true);
    }
    return callback(null, false);
  },
  credentials: true
}));

// Uploaded photos arrive as base64 data URLs, so allow a larger JSON body.
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));
app.use(cookieParser());
app.use(hpp());

// --- Simple Health Check ---
app.get("/", (req: Request, res: Response) => {
  res.status(200).json({
    status: "success",
    message: `${ENV.APP_NAME} instance is healthy - 3B - New Features!`,
    timestamp: new Date().toISOString(),
    environment: ENV.NODE_ENV
  });
});

// --- API Health Check ---
app.get("/api/health", (_req: Request, res: Response) => {
  res.status(200).json({
    status: "success",
    message: "API is healthy",
    timestamp: new Date().toISOString()
  });
});

// --- API Routes ---
app.use("/api", routes);

// --- 404 Handler ---
app.use((req: Request, res: Response) => {
  res.status(404).json({
    status: "error",
    message: `Cannot ${req.method} ${req.originalUrl}`
  });
});

// --- Global Error Handler ---
app.use((err: any, req: Request, res: Response, _next: NextFunction) => {
  console.error("🔥 Global Error Hook:", err.message);
  
  const statusCode = err.status || 500;
  res.status(statusCode).json({
    status: "error",
    message: ENV.NODE_ENV === "production" ? "Internal Server Error" : err.message,
    ...(ENV.NODE_ENV !== "production" && { stack: err.stack })
  });
});

export default app;