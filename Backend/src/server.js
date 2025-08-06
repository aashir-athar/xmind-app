import express from "express";
import { ENV } from "./config/env.js";
import { connectDB } from "./config/db.js";

const app = express();

const startServer = async () => {
  try {
    await connectDB();
    app.get("/", (req, res) => res.send("Hello from server!"));

    app.listen(ENV.PORT, () =>
      console.log("Server is up and running on PORT:", ENV.PORT)
    );
  } catch (error) {
    console.error("Failed to start server:", error);
    process.exit(1);
  }
};

startServer();
app.get("/", (req, res) => res.send("Hello from server!"));
