interface Instruction {
  op: string;
  args?: any[];
}

interface Position {
  x: number;
  y: number;
  dir_x: number;
  dir_y: number;
}

export class VirtualMachine {
  private stack: any[] = [];
  private variables: Map<string, any> = new Map();
  private functions: Map<string, number> = new Map();
  private callStack: number[] = [];
  private ip = 0;
  private readonly bytecode: Instruction[] = [];
  private instructionCount: number = 0;
  private curPosition: Position = { x: 1, y: 0, dir_x: 0, dir_y: 1 };
  private readonly visitedPositions: Position[] = [];
  private readonly maze: number[][];

  constructor(maze: number[][], bytecode: Instruction[]) {
    this.maze = maze;
    this.bytecode = bytecode;
  }

  public run(): Position[] {
    this.stack = [];
    this.variables = new Map();
    this.functions = new Map();
    this.callStack = [];
    this.ip = 0;

    this.visitedPositions.push(this.curPosition);

    for (let i = 0; i < this.bytecode.length; i++) {
      const instr = this.bytecode[i];
      if (instr.op === "FUNC") {
        this.functions.set(instr.args![0], i);
      }
    }

    if (!this.functions.has("main")) throw new Error("No main function found");
    this.ip = this.functions.get("main")! + 1;

    while (this.ip < this.bytecode.length) {
      const instr = this.bytecode[this.ip++];
      this.execute(instr);
    }
    return this.visitedPositions;
  }

  private execute(instr: Instruction): void {
    this.instructionCount++;
    switch (instr.op) {
      case "PUSH_INT":
      case "PUSH_FLOAT":
        this.stack.push(instr.args![0]);
        break;
      case "LOAD":
        this.stack.push(this.variables.get(instr.args![0]));
        break;
      case "STORE":
        this.variables.set(instr.args![0], this.stack.pop());
        break;
      case "ADD": this.binaryOp((a, b) => a + b); break;
      case "SUB": this.binaryOp((a, b) => a - b); break;
      case "MUL": this.binaryOp((a, b) => a * b); break;
      case "DIV": this.binaryOp((a, b) => a / b); break;
      case "MOD": this.binaryOp((a, b) => a % b); break;
      case "EQ": this.binaryOp((a, b) => a === b ? 1 : 0); break;
      case "NE": this.binaryOp((a, b) => a !== b ? 1 : 0); break;
      case "LT": this.binaryOp((a, b) => a < b ? 1 : 0); break;
      case "LE": this.binaryOp((a, b) => a <= b ? 1 : 0); break;
      case "GT": this.binaryOp((a, b) => a > b ? 1 : 0); break;
      case "GE": this.binaryOp((a, b) => a >= b ? 1 : 0); break;
      case "AND": this.binaryOp((a, b) => a && b ? 1 : 0); break;
      case "OR": this.binaryOp((a, b) => a || b ? 1 : 0); break;
      case "NEG": this.stack.push(-this.stack.pop()); break;
      case "NOT": this.stack.push(!this.stack.pop() ? 1 : 0); break;
      case "JMP":
        this.jumpToLabel(instr.args![0]);
        break;
      case "JMP_IF_FALSE":
        if (!this.stack.pop()) this.jumpToLabel(instr.args![0]);
        break;
      case "CALL":
        const [fname, _argc] = instr.args!;
        if (this.builtin(fname)) return;
        this.callStack.push(this.ip);
        this.ip = this.functions.get(fname)! + 1;
        break;
      case "RET":
        this.ip = this.callStack.pop()!;
        break;
      case "RET_VOID":
        this.ip = this.callStack.pop()!;
        break;
      case "NOP": break;
      case "LABEL": break;
      case "FUNC": break;
      case "END":
        if (this.callStack.length > 0) this.ip = this.callStack.pop()!;
        else this.ip = this.bytecode.length;
        break;
      default:
        throw new Error("Unknown op: " + instr.op);
    }
  }

  private binaryOp(fn: (a: any, b: any) => any): void {
    const b = this.stack.pop();
    const a = this.stack.pop();
    this.stack.push(fn(a, b));
  }

  private jumpToLabel(label: string): void {
    for (let i = 0; i < this.bytecode.length; i++) {
      const instr = this.bytecode[i];
      if (instr.op === "LABEL" && instr.args![0] === label) {
        this.ip = i + 1;
        return;
      }
    }
    throw new Error(`Label not found: ${label}`);
  }

  private builtin(name: string): boolean {
    if (name === "move_forward") {
      if (this.maze[this.curPosition.y + this.curPosition.dir_y][this.curPosition.x + this.curPosition.dir_x] !== 1) {
        this.maze[this.curPosition.y][this.curPosition.x] = 0;
        this.curPosition = { x: this.curPosition.x + this.curPosition.dir_x, y: this.curPosition.y + this.curPosition.dir_y, dir_x: this.curPosition.dir_x, dir_y: this.curPosition.dir_y };
        this.visitedPositions.push(this.curPosition);
        this.stack.push(1);
      }
      else {
        this.stack.push(0);
      }
      return true;
    }
    if (name === "turn_right") {
      this.curPosition = { x: this.curPosition.x, y: this.curPosition.y, dir_x: -this.curPosition.dir_y, dir_y: this.curPosition.dir_x };
      return true;
    }
    if (name === "turn_left") {
      this.curPosition = { x: this.curPosition.x, y: this.curPosition.y, dir_x: this.curPosition.dir_y, dir_y: -this.curPosition.dir_x };
      return true;
    }
    if (name === "print") {
      const val = this.stack.pop();
      console.log("Print:", val);
      return true;
    }
    if (name === "is_wall") {
      if (this.maze[this.curPosition.y + this.curPosition.dir_y][this.curPosition.x + this.curPosition.dir_x] === 1) {
        this.stack.push(1);
      }
      else {
        this.stack.push(0);
      }
      return true;
    }
    if (name === "completed") {
      if (this.maze[this.curPosition.y][this.curPosition.y] === 3) {
        this.stack.push(1);
      }
      else {
        this.stack.push(0);
      }
      return true;
    }
    if (name === "teleport") {
      const x = this.stack.pop()!;
      const y = this.stack.pop()!;
      this.curPosition = { x: x, y: y, dir_x: this.curPosition.dir_x, dir_y: this.curPosition.dir_y };
      this.visitedPositions.push(this.curPosition);
      return true;
    }
    return false;
  }
}
