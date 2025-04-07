import express from "express";
import cors from "cors";

const app = express();

app.use(cors());
app.use(express.json());

app.use("/api",);

app.listen(3000, () => {
  console.log("Server listening on port 3000");
});
