import {ServiceBase} from "./service-base";
import {Unit} from "../unit";
import * as bcrypt from "bcrypt";

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

    public async updateUserPassword(username: string, newPassword: string): Promise<boolean> {
        const passwordHash = await bcrypt.hash(newPassword, 10);
        const stmt = await this.unit.prepare(`
            update Users set passwordHash = ? where username = ?`, [passwordHash, username]);
        const [success, _] = await this.executeStmt(stmt);
        return success;
    }

    public async deleteUser(username: string): Promise<boolean> {
        const stmt = await this.unit.prepare('delete from Users where username = ?', username);
        const [success, _] = await this.executeStmt(stmt);
        return success;
    }

    public async getUser(username: string): Promise<any | null> {
        const stmt = await this.unit.prepare('select * from Users where username = ?', username);
        return ServiceBase.nullIfUndefined(await stmt.get());
    }

    public async userExists(username: string): Promise<boolean> {
        const stmt = await this.unit.prepare('select count(*) as cnt from Users where username = ?', username);
        const result = ServiceBase.unwrapSingle<number>(await stmt.get(), 'cnt');
        return result !== null && result > 0;
    }
}