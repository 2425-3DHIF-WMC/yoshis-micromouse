import {
  Token, TokenType,
} from "./token";
import * as AST from "./ast";

export class Parser {
  private tokens: Token[];
  private current = 0;

  constructor(tokens: Token[]) {
    this.tokens = tokens;
  }

  public parseProgram(): AST.Program {
    const body: AST.Statement[] = [];
    while (!this.isAtEnd()) {
      body.push(this.declaration());
    }
    return { type: "Program", body };
  }

  private declaration(): AST.Statement {
    if (this.match("func")) {
      return this.functionDeclaration();
    }

    if (this.checkTypeKeyword()) {
      return this.variableDeclaration();
    }

    return this.statement();
  }

  private checkTypeKeyword(): boolean {
    return this.check("int") || this.check("float") || this.check("bool");
  }

  private variableDeclaration(): AST.VarDeclaration {
    const varType = this.advance().value;
    const name = this.consume(TokenType.Identifier, "Expected variable name").value;
    this.consume(TokenType.Operator, "Expected '='");
    const initializer = this.expression();
    this.consumeSymbol(";");
    return {
      type: "VarDeclaration",
      varType,
      name,
      initializer,
    };
  }

  private functionDeclaration(): AST.FunctionDeclaration {
    this.consume("func");
    const returnType = this.consumeType();
    const name = this.consume(TokenType.Identifier, "Expected function name").value;
    this.consumeSymbol("(");

    const params: AST.Parameter[] = [];
    if (!this.checkSymbol(")")) {
      do {
        const paramType = this.consumeType();
        const paramName = this.consume(TokenType.Identifier, "Expected parameter name").value;
        params.push({ name: paramName, paramType });
      } while (this.matchSymbol(","));
    }

    this.consumeSymbol(")");
    const body = this.blockStatement();

    return {
      type: "FunctionDeclaration",
      returnType,
      name,
      params,
      body,
    };
  }
  private statement(): AST.Statement {
    if (this.match("if")) return this.ifStatement();
    if (this.match("while")) return this.whileStatement();
    if (this.match("return")) return this.returnStatement();
    if (this.checkSymbol("{")) return this.blockStatement();

    if (this.check(TokenType.Identifier) && this.checkNext(TokenType.Operator, "=")) {
      return this.assignment();
    }

    return this.expressionStatement();
  }

  private assignment(): AST.Assignment {
    const name = this.advance().value;
    this.consumeOperator("=");
    const value = this.expression();
    this.consumeSymbol(";");
    return {
      type: "Assignment",
      name,
      value
    };
  }

  private ifStatement(): AST.IfStatement {
    this.consumeSymbol("(");
    const test = this.expression();
    this.consumeSymbol(")");
    const consequent = this.blockStatement();
    return { type: "IfStatement", test, consequent };
  }

  private whileStatement(): AST.WhileStatement {
    this.consumeSymbol("(");
    const test = this.expression();
    this.consumeSymbol(")");
    const body = this.blockStatement();
    return { type: "WhileStatement", test, body };
  }

  private returnStatement(): AST.ReturnStatement {
    if (!this.checkSymbol(";")) {
      const arg = this.expression();
      this.consumeSymbol(";");
      return { type: "ReturnStatement", argument: arg };
    }
    this.consumeSymbol(";");
    return { type: "ReturnStatement", argument: null };
  }

  private blockStatement(): AST.BlockStatement {
    this.consumeSymbol("{");
    const body: AST.Statement[] = [];
    while (!this.checkSymbol("}") && !this.isAtEnd()) {
      body.push(this.declaration());
    }
    this.consumeSymbol("}");
    return { type: "BlockStatement", body };
  }

  private expressionStatement(): AST.ExpressionStatement {
    const expr = this.expression();
    this.consumeSymbol(";");
    return { type: "ExpressionStatement", expression: expr };
  }

  private expression(): AST.Expression {
    return this.logicOr();
  }

  private logicOr(): AST.Expression {
    let expr = this.logicAnd();
    while (this.matchOperator("||")) {
      const operator = this.previous().value;
      const right = this.logicAnd();
      expr = { type: "BinaryExpression", operator, left: expr, right };
    }
    return expr;
  }

  private logicAnd(): AST.Expression {
    let expr = this.equality();
    while (this.matchOperator("&&")) {
      const operator = this.previous().value;
      const right = this.equality();
      expr = { type: "BinaryExpression", operator, left: expr, right };
    }
    return expr;
  }

  private equality(): AST.Expression {
    let expr = this.comparison();
    while (this.matchOperator("==", "!=")) {
      const operator = this.previous().value;
      const right = this.comparison();
      expr = { type: "BinaryExpression", operator, left: expr, right };
    }
    return expr;
  }

  private comparison(): AST.Expression {
    let expr = this.term();
    while (this.matchOperator("<", "<=", ">", ">=")) {
      const operator = this.previous().value;
      const right = this.term();
      expr = { type: "BinaryExpression", operator, left: expr, right };
    }
    return expr;
  }

  private term(): AST.Expression {
    let expr = this.factor();
    while (this.matchOperator("+", "-")) {
      const operator = this.previous().value;
      const right = this.factor();
      expr = { type: "BinaryExpression", operator, left: expr, right };
    }
    return expr;
  }

  private factor(): AST.Expression {
    let expr = this.unary();
    while (this.matchOperator("*", "/", "%")) {
      const operator = this.previous().value;
      const right = this.unary();
      expr = { type: "BinaryExpression", operator, left: expr, right };
    }
    return expr;
  }

  private unary(): AST.Expression {
    if (this.matchOperator("!", "-")) {
      const operator = this.previous().value;
      const argument = this.unary();
      return { type: "UnaryExpression", operator, argument };
    }
    return this.primary();
  }

  private primary(): AST.Expression {
    if (this.match(TokenType.Number)) {
      const raw = this.previous().value;
      return { type: "Literal", value: Number(raw), raw };
    }

    if (this.match(TokenType.Boolean)) {
      const raw = this.previous().value;
      return { type: "Literal", value: raw === "true", raw };
    }

    if (this.match(TokenType.Identifier)) {
      const id = { type: "Identifier", name: this.previous().value } as AST.Identifier;
      if (this.matchSymbol("(")) {
        const args: AST.Expression[] = [];
        if (!this.checkSymbol(")")) {
          do {
            args.push(this.expression());
          } while (this.matchSymbol(","));
        }
        this.consumeSymbol(")");
        return { type: "CallExpression", callee: id, arguments: args };
      }
      return id;
    }

    if (this.matchSymbol("(")) {
      const expr = this.expression();
      this.consumeSymbol(")");
      return expr;
    }

    throw new Error(`Unexpected token: ${this.peek().value}`);
  }
  private match(...types: (TokenType | string)[]): boolean {
    for (const type of types) {
      if (this.check(type)) {
        this.advance();
        return true;
      }
    }
    return false;
  }

  private matchSymbol(...values: string[]): boolean {
    if (this.check(TokenType.Symbol) && values.includes(this.peek().value)) {
      this.advance();
      return true;
    }
    return false;
  }

  private matchOperator(...ops: string[]): boolean {
    if (this.check(TokenType.Operator) && ops.includes(this.peek().value)) {
      this.advance();
      return true;
    }
    return false;
  }

  private consume(expectedTypeOrKeyword: TokenType | string, errorMsg = "Unexpected token") {
    if (this.check(expectedTypeOrKeyword)) return this.advance();
    throw new Error(`${errorMsg} at line ${this.peek().line}`);
  }

  private consumeType(): string {
    const token = this.consume(TokenType.Keyword, "Expected type keyword");
    if (!["int", "float", "bool", "void"].includes(token.value)) {
      throw new Error("Expected type keyword");
    }
    return token.value;
  }

  private consumeOperator(expected: string) {
    const token = this.consume(TokenType.Operator, `Expected operator '${expected}'`);
    if (token.value !== expected) {
      throw new Error(`Expected operator '${expected}' but got '${token.value}'`);
    }
  }

  private consumeSymbol(expected: string) {
    const token = this.consume(TokenType.Symbol, `Expected symbol '${expected}'`);
    if (token.value !== expected) {
      throw new Error(`Expected symbol '${expected}' but got '${token.value}'`);
    }
  }

  private check(typeOrValue: TokenType | string): boolean {
    if (this.isAtEnd()) return false;
    const token = this.peek();
    return token.type === typeOrValue || token.value === typeOrValue;
  }

  private checkNext(type: TokenType, value?: string): boolean {
    const token = this.tokens[this.current + 1];
    if (!token) return false;
    return token.type === type && (value === undefined || token.value === value);
  }

  private advance(): Token {
    if (!this.isAtEnd()) this.current++;
    return this.previous();
  }

  private peek(): Token {
    return this.tokens[this.current];
  }

  private previous(): Token {
    return this.tokens[this.current - 1];
  }

  private isAtEnd(): boolean {
    return this.peek().type === TokenType.EOF;
  }

  private checkSymbol(symbol: string): boolean {
    return !this.isAtEnd() &&
      this.peek().type === TokenType.Symbol &&
      this.peek().value === symbol;
  }

}
