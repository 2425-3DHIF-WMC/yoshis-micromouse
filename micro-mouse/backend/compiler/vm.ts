interface Instruction {
  op: string;
  args?: any[];
}

export class VirtualMachine {
  private stack: any[] = [];
  private variables: Map<string, any> = new Map();
  private functions: Map<string, number> = new Map();
  private callStack: number[] = [];
  private ip = 0;
  private bytecode: Instruction[] = [];

  public run(bytecode: Instruction[]): void {
    this.stack = [];
    this.variables = new Map();
    this.functions = new Map();
    this.callStack = [];
    this.ip = 0;
    this.bytecode = bytecode;

    for (let i = 0; i < bytecode.length; i++) {
      const instr = bytecode[i];
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
  }

  private execute(instr: Instruction): void {
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
        this.stack.pop();
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
      console.log("Car moves forward");
      return true;
    }
    if (name === "turn_left") {
      console.log("Car turns left");
      return true;
    }
    if (name === "turn_right") {
      console.log("Car turns right");
      return true;
    }
    if (name === "print") {
      const val = this.stack.pop();
      console.log("Print:", val);
      return true;
    }
    if(name === "wall_forward") {
      console.log("Walls forward");
      return true;
    }
    return false;
  }
}
