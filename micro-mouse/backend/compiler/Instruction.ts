export enum InstructionType {
    LoadConst,
    Add,
    Subtract,
    Multiply,
    Divide,
    Negative,
    Negation,
    Equal,
    NotEqual,
    GreaterThan,
    LessThan,
    Jump,
    JumpNeq,
    Exit,
}

export class Instruction {
    public readonly type: InstructionType;
    public readonly op1: string;
    public readonly op2: string;

    public constructor(type: InstructionType, op1: string, op2: string) {
        this.op1 = op1;
        this.op2 = op2;
        this.type = type;
    }
}