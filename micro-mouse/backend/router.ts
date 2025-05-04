import { Router } from "express";
import huntAndKill from "./generator";

const mazeRouter = Router();

mazeRouter.get("/generate-maze", (req, res) => {
    const width = parseInt(req.query.width as string) || 16;
    const height = parseInt(req.query.height as string) || 16;
    const maze = huntAndKill(width, height);
    res.json(maze);
});

export default mazeRouter;