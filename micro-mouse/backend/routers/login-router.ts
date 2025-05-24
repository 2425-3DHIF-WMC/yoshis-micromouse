import { UserService } from "../services/user-service";
import express from "express";
import { StatusCodes } from "http-status-codes";
import { Unit } from "../db/unit";
import * as bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

export const loginRouter = express.Router();
const SECRET_KEY = "dein-geheimes-schluessel";

loginRouter.post('/register', async (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res.status(StatusCodes.BAD_REQUEST).json({ error: "Benutzername und Passwort sind erforderlich." });
  }

  const unit = await Unit.create(false);

  try {
    const service = new UserService(unit);
    const [success, error] = await service.registerUser(username, password);

    if (success) {
      await unit.complete(true);
      res.status(StatusCodes.CREATED).json({ message: "Benutzer erfolgreich registriert." });
    } else {
      await unit.complete(false);
      res.status(StatusCodes.CONFLICT).json({ error });
    }
  } catch (e) {
    console.error(e);
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ error: "Ein Fehler ist aufgetreten." });
  } finally {
    await unit.complete(false);
  }
});


loginRouter.post("/login", async (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res.status(400).json({ error: "Benutzername und Passwort sind erforderlich." });
  }

  const unit = await Unit.create(true);

  try {
    const userService = new UserService(unit);
    const user = await userService.getUser(username);

    if (!user) {
      return res.status(401).json({ error: "Ungültige Anmeldedaten." });
    }

    const passwordMatch = await bcrypt.compare(password, user.passwordHash);
    if (!passwordMatch) {
      return res.status(401).json({ error: "Ungültige Anmeldedaten." });
    }

    const token = jwt.sign({ username: user.username }, SECRET_KEY, { expiresIn: "1h" });
    res.json({ token });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Ein Fehler ist aufgetreten." });
  } finally {
    await unit.complete();
  }
});

loginRouter.get('/user', async (req, res) => {
  const { username } = req.query;

  if (!username) {
    return res.status(StatusCodes.BAD_REQUEST).json({ error: "Benutzername ist erforderlich." });
  }

  const unit = await Unit.create(true);

  try {
    const service = new UserService(unit);
    const user = await service.getUser(username as string);

    if (user) {
      res.status(StatusCodes.OK).json(user);
    } else {
      res.status(StatusCodes.NOT_FOUND).json({ error: "Benutzer nicht gefunden." });
    }
  } catch (e) {
    console.error(e);
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ error: "Ein Fehler ist aufgetreten." });
  } finally {
    await unit.complete();
  }
});

loginRouter.get('/scores', async (req, res) => {
  const unit = await Unit.create(true);

  try {
    const service = new UserService(unit);
    const scores = await service.getScores();

    if (scores) {
      res.status(StatusCodes.OK).json(scores);
    } else {
      res.status(StatusCodes.NOT_FOUND).json({ error: "kein Benutzer" });
    }
  } catch (e) {
    console.error(e);
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ error: "Ein Fehler ist aufgetreten." });
  } finally {
    await unit.complete();
  }
});

loginRouter.post('/update-score', async (req, res) => {
  const { username, timeInMilliseconds } = req.body;

  if (!username || timeInMilliseconds === undefined) {
    return res.status(StatusCodes.BAD_REQUEST).json({ error: "Benutzername und Zeit in Millisekunden sind erforderlich." });
  }

  const unit = await Unit.create(false);

  try {
    const service = new UserService(unit);
    const success = await service.updateScore(username, timeInMilliseconds);

    if (success) {
      await unit.complete(true);
      res.status(StatusCodes.OK).json({ message: "Score erfolgreich aktualisiert." });
    } else {
      await unit.complete(false);
      res.status(StatusCodes.CONFLICT).json({ error: "Score wurde nicht aktualisiert." });
    }
  } catch (e) {
    console.error(e);
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ error: "Ein Fehler ist aufgetreten." });
  } finally {
    await unit.complete(false);
  }
});
