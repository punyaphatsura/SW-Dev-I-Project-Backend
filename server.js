import express from "express";
import dotenv from "dotenv";

dotenv.config({ path: "./config/config.env" });

const app = express();
app.get("/", (req, res) => {
  res.status(200).json({ succes: true, data: { id: 1 } });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${process.env.NODE_ENV}`);
});
