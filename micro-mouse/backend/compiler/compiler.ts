// Bytecode Compiler: Translates AST to bytecode
import * as AST from "./ast";

interface Instruction {
    op: string;
    args?: any[];
}

export class BytecodeCompiler {
    private bytecode: Instruction[] = [];
    private labelCount = 0;

    public compile(program: AST.Program): Instruction[] {
        this.bytecode = [];
        for (const stmt of program.body) {
            if (stmt.type === "FunctionDeclaration") {
                this.emit({ op: `FUNC`, args: [stmt.name, stmt.params.length] });
                this.compileFunction(stmt);
                this.emit({ op: `END` });
            } else {
                throw new Error("Top-level statements must be functions");
            }
        }
        return this.bytecode;
    }

    private compileFunction(fn: AST.FunctionDeclaration): void {
        for (const stmt of fn.body.body) {
            this.compileStatement(stmt);
        }
    }

    private compileStatement(stmt: AST.Statement): void {
        switch (stmt.type) {
            case "VarDeclaration":
                this.compileExpression(stmt.initializer);
                this.emit({ op: "STORE", args: [stmt.name] });
                break;
            case "Assignment":
                this.compileExpression(stmt.value);
                this.emit({ op: "STORE", args: [stmt.name] });
                break;
            case "ExpressionStatement":
                this.compileExpression(stmt.expression);
                this.emit({ op: "NOP" });
                break;
            case "IfStatement":
                this.compileIf(stmt);
                break;
            case "WhileStatement":
                this.compileWhile(stmt);
                break;
            case "ReturnStatement":
                if (stmt.argument) {
                    this.compileExpression(stmt.argument);
                    this.emit({ op: "RET" });
                } else {
                    this.emit({ op: "RET_VOID" });
                }
                break;
            case "BlockStatement":
                for (const s of stmt.body) this.compileStatement(s);
                break;
            default:
                throw new Error("Unknown statement type: " + (stmt as any).type);
        }
    }

    private compileExpression(expr: AST.Expression): void {
        switch (expr.type) {
            case "Literal":
                if (typeof expr.value === "number") {
                    this.emit({ op: expr.raw.includes(".") ? "PUSH_FLOAT" : "PUSH_INT", args: [expr.value] });
                } else {
                    this.emit({ op: "PUSH_INT", args: [expr.value ? 1 : 0] });
                }
                break;
            case "Identifier":
                this.emit({ op: "LOAD", args: [expr.name] });
                break;
            case "BinaryExpression":
                this.compileExpression(expr.left);
                this.compileExpression(expr.right);
                this.emit({ op: this.mapBinaryOp(expr.operator) });
                break;
            case "UnaryExpression":
                this.compileExpression(expr.argument);
                this.emit({ op: this.mapUnaryOp(expr.operator) });
                break;
            case "CallExpression": {
                const name = expr.callee.name;
                if (["move_forward", "turn_left", "turn_right", "wall_forward"].includes(name)) {
                    if (expr.arguments.length !== 0) {
                        throw new Error(`'${name}' does not take arguments`);
                    }
                } else if (name === "print") {
                    if (expr.arguments.length !== 1) {
                        throw new Error(`'print' takes exactly one argument`);
                    }
                    this.compileExpression(expr.arguments[0]);
                } else {
                    for (const arg of expr.arguments) {
                        this.compileExpression(arg);
                    }
                }
                this.emit({ op: "CALL", args: [name, expr.arguments.length] });
                break;
            }
            default:
                throw new Error("Unknown expression type: " + (expr as any).type);
        }
    }

    private compileIf(stmt: AST.IfStatement): void {
        const elseLabel = this.newLabel();
        const endLabel = this.newLabel();

        this.compileExpression(stmt.test);
        this.emit({ op: "JMP_IF_FALSE", args: [elseLabel] });
        this.compileStatement(stmt.consequent);
        this.emit({ op: "JMP", args: [endLabel] });
        this.emit({ op: "LABEL", args: [elseLabel] });
        this.emit({ op: "LABEL", args: [endLabel] });
    }

    private compileWhile(stmt: AST.WhileStatement): void {
        const startLabel = this.newLabel();
        const endLabel = this.newLabel();

        this.emit({ op: "LABEL", args: [startLabel] });
        this.compileExpression(stmt.test);
        this.emit({ op: "JMP_IF_FALSE", args: [endLabel] });
        this.compileStatement(stmt.body);
        this.emit({ op: "JMP", args: [startLabel] });
        this.emit({ op: "LABEL", args: [endLabel] });
    }

    private emit(instr: Instruction): void {
        this.bytecode.push(instr);
    }

    private newLabel(): string {
        return `L${this.labelCount++}`;
    }

    private mapBinaryOp(op: string): string {
        const binOps: Record<string, string> = {
            "+": "ADD",
            "-": "SUB",
            "*": "MUL",
            "/": "DIV",
            "%": "MOD",
            "==": "EQ",
            "!=": "NE",
            "<": "LT",
            "<=": "LE",
            ">": "GT",
            ">=": "GE",
            "&&": "AND",
            "||": "OR"
        };
        return binOps[op];
    }

    private mapUnaryOp(op: string): string {
        const unaryOps: Record<string, string> = {
            "-": "NEG",
            "!": "NOT"
        };
        return unaryOps[op];
    }
}
