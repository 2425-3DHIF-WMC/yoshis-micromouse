import { ServiceBase } from "./service-base";
import { Unit } from "../db/unit";
import * as bcrypt from "bcrypt";
import { IScore, IUser } from "../model";


export class UserService extends ServiceBase {
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
    const stmt = await this.unit.prepare('select username, instructionCount, seed, time from RECORDS');
    const rows = await stmt.all() as IScore[];
    return rows;
  }

  public async addScore(score: IScore): Promise<boolean> {
    const stmt = await this.unit.prepare('INSERT INTO RECORDS (username, instructionCount, seed, time) values (?, ?, ?, ?)', [score.username, score.instructionCount, score.seed, score.time]);
    const [success, _] = await this.executeStmt(stmt);
    return success;
  }

  public async userExists(username: string): Promise<boolean> {
    const stmt = await this.unit.prepare('select count(*) as cnt from Users where username = ?', username);
    const result = ServiceBase.unwrapSingle<number>(await stmt.get(), 'cnt');
    return result !== null && result > 0;
  }
}
