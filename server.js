import express from "express";
import dotenv from "dotenv";
import connectDB from "./config/db.js";

dotenv.config({ path: "./config/config.env" });

// connnect database
connectDB();

//Route files
import { router as restaurants } from "./routes/restaurants.js";

const app = express();
// app.get("/", (req, res) => {
//   res.status(200).json({ succes: true, data: { id: 1 } });
// });

app.use("/api/v1/restaurants", restaurants);

const PORT = process.env.PORT || 3000;
const server = app.listen(
  PORT,
  console.log("Server running in "),
  process.env.NODE_ENV,
  " mode on port ",
  PORT,
);

//Handle unhandle promise rejections
process.on("unhandledRejection", (err, promise) => {
  console.log(`Error: ${err.massage}`);
  //Close server & exit process
  server.close(() => process.exit(1));
});
