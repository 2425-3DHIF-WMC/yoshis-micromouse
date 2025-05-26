import * as AST from "./ast";
import { Type } from "./ast";

interface VariableSymbol {
  type: Type;
}

interface FunctionSymbol {
  returnType: Type;
  paramTypes: Type[];
}

export class SemanticAnalyzer {
  private scopes: Map<string, VariableSymbol>[] = [];
  private functions: Map<string, FunctionSymbol> = new Map();
  private currentFunctionReturnType: Type | null = null;
  private insideLoop: boolean = false;

  public analyze(program: AST.Program): void {
    this.beginScope();

    this.functions.set('move_forward', { returnType: "bool", paramTypes: [] });
    this.functions.set('turn_left', { returnType: 'void', paramTypes: [] });
    this.functions.set('turn_right', { returnType: 'void', paramTypes: [] });
    this.functions.set('print', { returnType: 'void', paramTypes: [] });
    this.functions.set('is_wall', { returnType: 'bool', paramTypes: [] });
    this.functions.set('completed', { returnType: 'bool', paramTypes: [] });
    this.functions.set('teleport', { returnType: 'void', paramTypes: ['int', 'int'] });
    this.functions.set('next_wall', { returnType: 'int', paramTypes: [] });

    for (const stmt of program.body) {
      this.checkStatement(stmt);
    }
    this.endScope();
  }

  private beginScope(): void {
    this.scopes.push(new Map());
  }

  private endScope(): void {
    this.scopes.pop();
  }

  private declareVariable(name: string, type: Type): void {
    const current = this.scopes[this.scopes.length - 1];
    if (current.has(name)) {
      throw new Error(`Variable '${name}' already declared in this scope`);
    }
    current.set(name, { type });
  }

  private lookupVariable(name: string): VariableSymbol {
    for (let i = this.scopes.length - 1; i >= 0; i--) {
      if (this.scopes[i].has(name)) {
        return this.scopes[i].get(name)!;
      }
    }
    throw new Error(`Undeclared variable '${name}'`);
  }

  private declareFunction(name: string, returnType: Type, paramTypes: Type[]): void {
    if (this.functions.has(name)) {
      throw new Error(`Function '${name}' already declared`);
    }
    this.functions.set(name, { returnType, paramTypes });
  }

  private lookupFunction(name: string): FunctionSymbol {
    const fn = this.functions.get(name);
    if (!fn) {
      throw new Error(`Undeclared function '${name}'`);
    }
    return fn;
  }

  private checkStatement(stmt: AST.Statement): void {
    switch (stmt.type) {
      case "VarDeclaration":
        this.checkVarDeclaration(stmt);
        break;
      case "Assignment":
        this.checkAssignment(stmt);
        break;
      case "FunctionDeclaration":
        this.checkFunctionDeclaration(stmt);
        break;
      case "IfStatement":
        this.checkIf(stmt);
        break;
      case "WhileStatement":
        this.checkWhile(stmt);
        break;
      case "ReturnStatement":
        this.checkReturn(stmt);
        break;
      case "ExpressionStatement":
        this.checkExpression(stmt.expression);
        break;
      case "BlockStatement":
        this.beginScope();
        for (const s of stmt.body) {
          this.checkStatement(s);
        }
        this.endScope();
        break;
      default:
        throw new Error(`Unknown statement type: ${(stmt as any).type}`);
    }
  }

  private checkVarDeclaration(stmt: AST.VarDeclaration): void {
    const initType = this.checkExpression(stmt.initializer);
    if (!this.isTypeCompatible(stmt.varType, initType)) {
      throw new Error(`Type mismatch: cannot assign ${initType} to ${stmt.varType}`);
    }
    this.declareVariable(stmt.name, stmt.varType);
  }

  private checkAssignment(stmt: AST.Assignment): void {
    const variable = this.lookupVariable(stmt.name);
    const valueType = this.checkExpression(stmt.value);
    if (!this.isTypeCompatible(variable.type, valueType)) {
      throw new Error(`Type mismatch in assignment to '${stmt.name}': expected ${variable.type}, got ${valueType}`);
    }
  }

  private checkFunctionDeclaration(stmt: AST.FunctionDeclaration): void {
    const paramTypes = stmt.params.map(p => p.paramType);
    this.declareFunction(stmt.name, stmt.returnType, paramTypes);

    this.beginScope();
    stmt.params.forEach(p => this.declareVariable(p.name, p.paramType));

    const prevReturnType = this.currentFunctionReturnType;
    this.currentFunctionReturnType = stmt.returnType;

    const allPathsReturn = this.checkReturns(stmt.body);

    if (stmt.returnType !== "void" && !allPathsReturn) {
      throw new Error(`Function '${stmt.name}' must return on all paths`);
    }

    this.currentFunctionReturnType = prevReturnType;
    this.endScope();
  }

  private checkReturns(stmt: AST.Statement): boolean {
    switch (stmt.type) {
      case "ReturnStatement":
        return true;
      case "BlockStatement":
        for (let i = 0; i < stmt.body.length; i++) {
          if (this.checkReturns(stmt.body[i])) {
            return true;
          }
        }
        return false;
      case "IfStatement":
        return this.checkReturns(stmt.consequent) && false;
      case "WhileStatement":
        return stmt.test.type === "Literal" && stmt.test.value === true && this.checkReturns(stmt.body);
      default:
        return false;
    }
  }

  private checkIf(stmt: AST.IfStatement): void {
    const condType = this.checkExpression(stmt.test);
    if (condType !== "bool") {
      throw new Error(`Condition in 'if' must be bool, got ${condType}`);
    }
    this.checkStatement(stmt.consequent);
  }

  private checkWhile(stmt: AST.WhileStatement): void {
    const condType = this.checkExpression(stmt.test);
    if (condType !== "bool") {
      throw new Error(`Condition in 'while' must be bool, got ${condType}`);
    }

    const wasInLoop = this.insideLoop;
    this.insideLoop = true;
    this.checkStatement(stmt.body);
    this.insideLoop = wasInLoop;
  }

  private checkReturn(stmt: AST.ReturnStatement): void {
    if (this.currentFunctionReturnType === null) {
      throw new Error(`'return' outside of a function`);
    }

    const expected = this.currentFunctionReturnType;

    if (stmt.argument === null) {
      if (expected !== "void") {
        throw new Error(`Return type mismatch: expected ${expected}, got void`);
      }
    } else {
      const actual = this.checkExpression(stmt.argument);
      if (!this.isTypeCompatible(expected, actual)) {
        throw new Error(`Return type mismatch: expected ${expected}, got ${actual}`);
      }
    }
  }

  private checkExpression(expr: AST.Expression): Type {
    switch (expr.type) {
      case "Literal":
        return typeof expr.value === "number" && expr.raw.includes(".") ? "float" :
          typeof expr.value === "number" ? "int" :
            "bool";

      case "Identifier":
        return this.lookupVariable(expr.name).type;

      case "BinaryExpression": {
        const left = this.checkExpression(expr.left);
        const right = this.checkExpression(expr.right);
        const op = expr.operator;

        if (["+", "-", "*", "/", "%"].includes(op)) {
          if (this.areNumeric(left, right)) {
            return left === "float" || right === "float" ? "float" : "int";
          }
          throw new Error(`Invalid operands for '${op}': ${left}, ${right}`);
        }

        if (["==", "!=", "<", "<=", ">", ">="].includes(op)) {
          if (this.areSameType(left, right)) return "bool";
          throw new Error(`Comparison operands must be same type: got ${left}, ${right}`);
        }

        if (["&&", "||"].includes(op)) {
          if (left === "bool" && right === "bool") return "bool";
          throw new Error(`Logical operators require bool: got ${left}, ${right}`);
        }

        throw new Error(`Unsupported binary operator '${op}'`);
      }

      case "UnaryExpression": {
        const argType = this.checkExpression(expr.argument);
        const op = expr.operator;
        if (op === "-" && this.isNumeric(argType)) return argType;
        if (op === "!" && argType === "bool") return "bool";
        throw new Error(`Invalid unary operator '${op}' on type ${argType}`);
      }

      case "CallExpression": {
        const fn = this.lookupFunction(expr.callee.name);
        if (fn.paramTypes.length !== expr.arguments.length) {
          throw new Error(`Function '${expr.callee.name}' expects ${fn.paramTypes.length} arguments`);
        }

        expr.arguments.forEach((arg, i) => {
          const argType = this.checkExpression(arg);
          const expected = fn.paramTypes[i];
          if (!this.isTypeCompatible(expected, argType)) {
            throw new Error(`Function arg ${i + 1} type mismatch: expected ${expected}, got ${argType}`);
          }
        });

        return fn.returnType;
      }

      default:
        throw new Error(`Unknown expression type: ${(expr as any).type}`);
    }
  }

  private isNumeric(type: Type): boolean {
    return type === "int" || type === "float";
  }

  private areNumeric(a: Type, b: Type): boolean {
    return this.isNumeric(a) && this.isNumeric(b);
  }

  private isTypeCompatible(expected: Type, actual: Type): boolean {
    return expected === actual || (expected === "float" && actual === "int");
  }

  private areSameType(a: Type, b: Type): boolean {
    return a === b;
  }
}
