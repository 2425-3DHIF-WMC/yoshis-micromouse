import {Database, open, Statement} from "sqlite";
import * as sqlite3 from "sqlite3";

export class Unit{
    private completed = false;
    private db: Database | null;
    private readonly statements: Statement[];

    constructor(public readonly readOnly: boolean) {
        this.db = null;
        this.statements = [];
    }

    private async init(): Promise<void> {
        this.db = await DB.createDBConnection();
        if (!this.readOnly) {
            await DB.beginTransaction(this.db);
        }
    }

    public async prepare(sql: string, bindings: any | null = null): Promise<Statement> {
        const stmt = await this.db!.prepare(sql);
        if (bindings != null){
            await stmt.bind(bindings);
        }
        this.statements.push(stmt);
        return stmt!;
    }

    public async getLastRowId(): Promise<number> {
        const result = await this.db!.get('select last_insert_rowid() as "id"');
        return result.id;
    }

    public async complete(commit: boolean | null = null): Promise<void> {
        if(this.completed){
            return;
        }
        this.completed = true;

        if(commit !== null){
            await (commit ? DB.commitTransaction(this.db!) : DB.rollbackTransaction(this.db!));
        } else if (!this.readOnly){
            throw new Error('transaction has been opend, requires information if commit or rollback needed');
        }

        for (const stmt of this.statements){
            await stmt.finalize();
        }
        await this.db!.close();
    }

    public static async create(readOnly: boolean): Promise<Unit> {
        const unit = new Unit(readOnly);
        await unit.init();
        return unit;
    }
}

export class DB {
    public static async createDBConnection(): Promise<Database> {
        const db = await open({
            filename: `./users.db`,
            driver: sqlite3.Database
        });
        await db.run('PRAGMA foreign_keys = ON');

        await DB.ensureTablesCreated(db);

        return db;
    }

    public static async beginTransaction(connection: Database): Promise<void> {
        await connection.run('begin transaction;');
    }

    public static async commitTransaction(connection: Database): Promise<void> {
        await connection.run('commit;');
    }

    public static async rollbackTransaction(connection: Database): Promise<void> {
        await connection.run('rollback;');
    }

    private static async ensureTablesCreated(connection: Database): Promise<void> {
        await connection.run(
            `CREATE TABLE IF NOT EXISTS Users (
                    username TEXT PRIMARY KEY,
                    passwordHash TEXT NOT NULL,
                    score INTEGER DEFAULT 0
                 ) STRICT`
        );
    }
}