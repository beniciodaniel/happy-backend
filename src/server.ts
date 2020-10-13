import express from "express";
import path from "path";
import "express-async-errors";
import cors from "cors";

import "./database/connection";

import routes from "./routes";
import errorHandler from "./errors/handle";

const app = express();
// aberto para todos;
app.use(cors());

app.use(express.json());
app.use(routes);
app.use("/uploads", express.static(path.join(__dirname, "..", "uploads")));
app.use(errorHandler);

app.listen(3333, () => {
  console.log("Server running on port 🚀 3333");
});
