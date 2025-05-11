import { Instruction, InstructionType } from "./Instruction";

export class Vm {
  private constantPool: number[];
  private instructions: Instruction[];

  private stackPointer: number;
  private stack: number[];

  private programCounter: number;

  public constructor(instructions: Instruction[], constantPool: number[]) {
    this.constantPool = constantPool;
    this.instructions = instructions;

    this.stackPointer = 0;
    this.programCounter = 0;

    this.stack = [];
  }

  public run() {
    while (this.programCounter != -1) {
      const curInstruction = this.instructions[this.programCounter];
      switch (curInstruction.type) {
        case InstructionType.LoadConst:
          this.stack.push(this.constantPool[Number(curInstruction.op1)]);
          this.programCounter++;
          this.stackPointer++;
          break;
        case InstructionType.Add:
          {
            const op1 = this.popStack();
            const op2 = this.popStack();

            this.stack.push(op1 + op2);
            this.stackPointer++;
            this.programCounter++;
            break;
          }
        case InstructionType.Subtract:
          {
            const op1 = this.popStack();
            const op2 = this.popStack();

            this.stack.push(op1 - op2);
            this.stackPointer++;
            this.programCounter++;
            break;
          }
        case InstructionType.Multiply:
          {
            const op1 = this.popStack();
            const op2 = this.popStack();

            this.stack.push(op1 * op2);
            this.stackPointer++;
            this.programCounter++;
            break;
          }
        case InstructionType.Divide:
          {
            const op1 = this.popStack();
            const op2 = this.popStack();

            this.stack.push(op1 / op2);
            this.stackPointer++;
            this.programCounter++;
            break;
          }
        case InstructionType.Negative:
          {
            const op1 = this.popStack();

            this.stack.push(-1 * op1);
            this.stackPointer++;
            this.programCounter++;
            break;
          }
        case InstructionType.Negation:
          {
            const op1 = this.popStack();

            this.stack.push(op1 == 1 ? 0 : 1);
            this.stackPointer++;
            this.programCounter++;
            break;
          }
        case InstructionType.Equal: {
          const op1 = this.popStack();
          const op2 = this.popStack();

          this.stack.push(op1 == op2 ? 1 : 0);
          this.stackPointer++;
          this.programCounter++;
          break;
        }
        case InstructionType.NotEqual: {
          const op1 = this.popStack();
          const op2 = this.popStack()!;

          this.stack.push(op1 != op2 ? 1 : 0);
          this.stackPointer++;
          this.programCounter++;
          break;
        }
        case InstructionType.GreaterThan: {
          const op1 = this.popStack();
          const op2 = this.popStack();

          this.stack.push(op1 > op2 ? 1 : 0);
          this.stackPointer++;
          this.programCounter++;
          break;
        }
        case InstructionType.LessThan: {
          const op1 = this.popStack();
          const op2 = this.popStack();

          this.stack.push(op1 < op2 ? 1 : 0);
          this.stackPointer++;
          this.programCounter++;
          break;
        }
        case InstructionType.Jump: {
          const offset = Number(curInstruction.op1);
          this.programCounter += offset;
          break;
        }

        case InstructionType.JumpNeq: {
          const offset = Number(curInstruction.op1);
          const condition = this.popStack()

          this.programCounter += condition == 0 ? offset : 1;
          break;
        }
        case InstructionType.Exit:
          this.programCounter = -1;
          break;
      }
    }
  }

  private popStack(): number {
    this.stackPointer--;
    return this.stack.pop()!;
  }
}
