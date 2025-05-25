import express from "express";
import cors from "cors";
import mazeRouter from "./routers/generator_router";
import { loginRouter } from "./routers/login-router";
import { compilerRouter } from "./routers/compiler_route";

const app = express();

app.use(cors());
app.use(express.json());

app.use("/api/maze", mazeRouter);
app.use("/api/user", loginRouter);
app.use("/api/compiler", compilerRouter);

app.listen(3001, () => {
  console.log("Server listening on port 3001");
});
