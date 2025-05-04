import { Router } from "express";
import huntAndKill from "./generator";

const mazeRouter = Router();

mazeRouter.get("/generate-maze", (req, res) => {
    const width = parseInt(req.query.width as string);
    const height = parseInt(req.query.height as string);
    const maze = huntAndKill(width, height);
    res.json(maze);
});

export default mazeRouter;