import { Router } from "express";
import { huntAndKill } from "../maze_generation/generator";
import { Md5 } from 'ts-md5';
import { StatusCodes } from "http-status-codes";

const mazeRouter = Router();

mazeRouter.get("/generate-maze", (req, res) => {
  const width = parseInt(req.query.width as string);
  const height = parseInt(req.query.height as string);

  if (isNaN(width) || isNaN(height)) {
    res.status(StatusCodes.BAD_REQUEST).send();
    return;
  }

  const seed = Md5.hashStr(Math.random().toString());
  const maze = huntAndKill(width, height, seed);
  res.status(StatusCodes.OK).json({ maze, seed });
});

mazeRouter.get("/generate-maze-seed", (req, res) => {
  const width = parseInt(req.query.width as string);
  const height = parseInt(req.query.height as string);
  const seed = req.query.seed as string;

  if (isNaN(width) || isNaN(height) || seed === "undefined") {
    res.status(StatusCodes.BAD_REQUEST).send();
    return;
  }

  const maze = huntAndKill(width, height, seed);
  res.status(StatusCodes.OK).json({ maze, seed });

})

export default mazeRouter;
