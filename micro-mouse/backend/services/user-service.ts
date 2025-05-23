import {ServiceBase} from "./service-base";
import {Unit} from "../unit";
import * as bcrypt from "bcrypt";
import {IScore, IUser} from "../model";

export class UserService extends ServiceBase{
    constructor(unit: Unit) {
        super(unit);
    }

    public async registerUser(username: string, password: string): Promise<[success: boolean, error: string | null]> {
        if (await this.userExists(username)) {
            return [false, "Benutzername existiert bereits"];
        }

        const passwordHash = await bcrypt.hash(password, 10);
        const stmt = await this.unit.prepare(`
            insert into Users (username, passwordHash) 
            values (?, ?)`, [username, passwordHash]);
        const [success, _] = await this.executeStmt(stmt);
        return [success, success ? null : "Registrierung fehlgeschlagen"];
    }

    public async getUser(username: string): Promise<IUser | null> {
        const stmt = await this.unit.prepare('select * from Users where username = ?', username);
        return ServiceBase.nullIfUndefined(await stmt.get());
    }

    public async getScores(): Promise<IScore[]> {
        const stmt = await this.unit.prepare('select username, score from Users order by score desc, username');
        const rows = await stmt.all();

        return rows.map(row => {
            const totalTime = row.score;
            const minutes = Math.floor(totalTime / 60000);
            const seconds = Math.floor((totalTime % 60000) / 1000);
            const milliseconds = totalTime % 1000;

            return {
                username: row.username,
                score: `${minutes}:${seconds.toString().padStart(2, '0')}.${milliseconds.toString().padStart(3, '0')}`
            }
        });
    }

    public async updateScore(username: string, timeInMilliseconds: number): Promise<boolean> {
        const stmt = await this.unit.prepare('SELECT score FROM Users WHERE username = ?', username);
        const currentScore = ServiceBase.unwrapSingle<number>(await stmt.get(), 'score');

        if (currentScore !== null && currentScore <= timeInMilliseconds) {
            return false;
        }

        const updateStmt = await this.unit.prepare(
            `UPDATE Users SET score = ? WHERE username = ?`,
            [timeInMilliseconds, username]
        );
        const [success, _] = await this.executeStmt(updateStmt);
        return success;
    }

    public async userExists(username: string): Promise<boolean> {
        const stmt = await this.unit.prepare('select count(*) as cnt from Users where username = ?', username);
        const result = ServiceBase.unwrapSingle<number>(await stmt.get(), 'cnt');
        return result !== null && result > 0;
    }
}