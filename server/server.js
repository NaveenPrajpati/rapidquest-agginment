import express, { json } from "express";
import { connect } from "mongoose";
import cors from "cors";

import { config } from "dotenv";
import router from "./routes/dataRoutes.js";

config();

const app = express();
app.use(cors());
app.use(json());

// Connect to MongoDB
connect(process.env.Mongo_Uri, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

const PORT = process.env.PORT || 4000;

app.use("/api/analytics", router);
app.listen(PORT, (req, res) => {
  console.log(`server running on port ${PORT}`);
});
