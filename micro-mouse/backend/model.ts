export interface IUser {
    username: string;
    passwordHash: string;
    score: number;
}

export interface IScore {
    username: string;
    score: string;
}