export interface IUser {
  username: string;
  passwordHash: string;
}


export interface IScore {
  username: string;
  instructionCount: number;
  seed: string;
  time: string;
}

