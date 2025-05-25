import { UserService } from "../services/user-service";
import express from "express";
import { StatusCodes } from "http-status-codes";
import { Unit } from "../db/unit";

export const leaderboardRouter = express.Router();

leaderboardRouter.get('/scores', async (req, res) => {
  const unit = await Unit.create(true);

  try {
    const service = new UserService(unit);
    const scores = await service.getScores();

    res.status(StatusCodes.OK).json(scores);
  } catch (e) {
    console.error(e);
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).send();
  } finally {
    await unit.complete();
  }
});

leaderboardRouter.post('/add-score', async (req, res) => {
  const { username, instructionCount, seed, time } = req.body;

  if (!username || isNaN(instructionCount) || !seed || !time) {
    return res.status(StatusCodes.BAD_REQUEST).send();
  }

  const unit = await Unit.create(false);

  try {
    const service = new UserService(unit);
    const success = await service.addScore({ username, instructionCount, seed, time });

    if (success) {
      await unit.complete(true);
      res.status(StatusCodes.NO_CONTENT).send();
    } else {
      await unit.complete(false);
      res.status(StatusCodes.BAD_REQUEST).send();
    }
  } catch (e) {
    console.error(e);
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).send();
  } finally {
    await unit.complete(false);
  }
});
