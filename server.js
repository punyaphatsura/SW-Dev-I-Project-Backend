import express from "express";
import dotenv from "dotenv";
import connectDB from "./config/db.js";
import cors from "cors";
import cookieParser from "cookie-parser";
import mongoSanitize from "express-mongo-sanitize";
import helmet from "helmet";
import { xss } from "express-xss-sanitizer";

//Route files
import { router as auth } from "./routes/auth.js";
import { router as restaurants } from "./routes/restaurants.js";

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
// app.get("/", (req, res) => {
//   res.status(200).json({ succes: true, data: { id: 1 } });
// });

app.use("/api/v1/restaurants", restaurants);
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
