import {UserService} from "./services/user-service";
import express from "express";
import {StatusCodes} from "http-status-codes";
import {Unit} from "./unit";
import * as bcrypt from "bcrypt";

export const loginRouter = express.Router();

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

loginRouter.post('/login', async (req, res) => {
    const {username, password} = req.body;

    if (!username || !password) {
        return res.status(StatusCodes.BAD_REQUEST).json({error: "Benutzername und Passwort sind erforderlich."});
    }

    const unit = await Unit.create(true);

    try {
        const service = new UserService(unit);
        const user = await service.getUser(username);

        if (!user) {
            return res.status(StatusCodes.UNAUTHORIZED).json({error: "Ungültige Anmeldedaten."});
        }

        const passwordMatch = await bcrypt.compare(password, user.passwordHash);
        if (!passwordMatch) {
            return res.status(StatusCodes.UNAUTHORIZED).json({error: "Ungültige Anmeldedaten."});
        }

        res.status(StatusCodes.OK).json({message: "Login erfolgreich."});
    } catch (e) {
        console.error(e);
        res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({error: "Ein Fehler ist aufgetreten."});
    } finally {
        await unit.complete();
    }
});

loginRouter.post('/update-password', async (req, res) => {
    const { username, newPassword } = req.body;

    if (!username || !newPassword) {
        return res.status(StatusCodes.BAD_REQUEST).json({ error: "Benutzername und neues Passwort sind erforderlich." });
    }

    const unit = await Unit.create(false);

    try {
        const service = new UserService(unit);
        const success = await service.updateUserPassword(username, newPassword);

        if (success) {
            await unit.complete(true);
            res.status(StatusCodes.OK).json({ message: "Passwort erfolgreich aktualisiert." });
        } else {
            await unit.complete(false);
            res.status(StatusCodes.NOT_FOUND).json({ error: "Benutzer nicht gefunden." });
        }
    } catch (e) {
        console.error(e);
        res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ error: "Ein Fehler ist aufgetreten." });
    } finally {
        await unit.complete(false);
    }
});

loginRouter.delete('/delete', async (req, res) => {
    const { username } = req.body;

    if (!username) {
        return res.status(StatusCodes.BAD_REQUEST).json({ error: "Benutzername ist erforderlich." });
    }

    const unit = await Unit.create(false);

    try {
        const service = new UserService(unit);
        const success = await service.deleteUser(username);

        if (success) {
            await unit.complete(true);
            res.status(StatusCodes.OK).json({ message: "Benutzer erfolgreich gelöscht." });
        } else {
            await unit.complete(false);
            res.status(StatusCodes.NOT_FOUND).json({ error: "Benutzer nicht gefunden." });
        }
    } catch (e) {
        console.error(e);
        res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ error: "Ein Fehler ist aufgetreten." });
    } finally {
        await unit.complete(false);
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