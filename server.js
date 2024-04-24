import express from "express";
import dotenv from "dotenv";
import connectDB from "./config/db.js";
import cors from "cors";
import cookieParser from "cookie-parser";
import mongoSanitize from "express-mongo-sanitize";
import helmet from "helmet";
import { xss } from "express-xss-sanitizer";
import rateLimit from "express-rate-limit";
import hpp from "hpp";

//Route files
import { router as auth } from "./routes/auth.js";
import { router as restaurants } from "./routes/restaurants.js";
import { router as appointments } from "./routes/appointments.js";

dotenv.config({ path: "./config/config.env" });

// connnect database
connectDB();

const app = express();

app.use(cors());
app.use(express.json());
//Body parser
app.use(cookieParser());
//Sanitize data
app.use(mongoSanitize());
//Set security headers
app.use(helmet());
//Prevent XSS attacks
app.use(xss());
//Rate Limiting
const limiter = rateLimit({
  windowsMs: 10 * 60 * 1000, //10 mins
  max: 100,
});
app.use(limiter);
//Prevent http param pollutions
app.use(hpp());

app.use("/api/v1/restaurants", restaurants);
app.use("/api/v1/appointments", appointments);
app.use("/api/v1/auth", auth);

const PORT = process.env.PORT || 3000;
console.log(process.env.FIREBASE_CONFIG);
const server = app.listen(
  PORT,
  console.log("Server running in port", PORT),
  process.env.NODE_ENV,
  " mode on port ",
  PORT
);

//Handle unhandle promise rejections
process.on("unhandledRejection", (err, promise) => {
  console.log(`Error: ${err.massage}`);
  //Close server & exit process
  server.close(() => process.exit(1));
});
