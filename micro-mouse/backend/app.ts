import express from "express";
import cors from "cors";
import mazeRouter from "./router";

const app = express();

app.use(cors());
app.use(express.json());

app.use("/api", mazeRouter);

app.listen(3001, () => {
  console.log("Server listening on port 3001");
});
