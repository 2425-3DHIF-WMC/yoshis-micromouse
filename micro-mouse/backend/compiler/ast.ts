export interface Node {
  type: string;
}

export interface Program extends Node {
  type: "Program";
  body: Statement[];
}

export type Statement =
  | VarDeclaration
  | FunctionDeclaration
  | IfStatement
  | WhileStatement
  | ReturnStatement
  | ExpressionStatement
  | BlockStatement
  | Assignment;

export interface VarDeclaration extends Node {
  type: "VarDeclaration";
  varType: string;
  name: string;
  initializer: Expression;
}

export interface Assignment extends Node {
  type: "Assignment";
  name: string;
  value: Expression;
}

export interface FunctionDeclaration extends Node {
  type: "FunctionDeclaration";
  returnType: string;
  name: string;
  params: Parameter[];
  body: BlockStatement;
}

export interface Parameter {
  name: string;
  paramType: string;
}

export interface IfStatement extends Node {
  type: "IfStatement";
  test: Expression;
  consequent: BlockStatement;
}

export interface WhileStatement extends Node {
  type: "WhileStatement";
  test: Expression;
  body: BlockStatement;
}

export interface ReturnStatement extends Node {
  type: "ReturnStatement";
  argument: Expression | null;
}

export interface ExpressionStatement extends Node {
  type: "ExpressionStatement";
  expression: Expression;
}

export interface BlockStatement extends Node {
  type: "BlockStatement";
  body: Statement[];
}

export type Expression =
  | BinaryExpression
  | UnaryExpression
  | Literal
  | Identifier
  | CallExpression;

export interface BinaryExpression extends Node {
  type: "BinaryExpression";
  operator: string;
  left: Expression;
  right: Expression;
}

export interface UnaryExpression extends Node {
  type: "UnaryExpression";
  operator: string;
  argument: Expression;
}

export interface Literal extends Node {
  type: "Literal";
  value: number | boolean;
  raw: string;
}

export interface Identifier extends Node {
  type: "Identifier";
  name: string;
}

export interface CallExpression extends Node {
  type: "CallExpression";
  callee: Identifier;
  arguments: Expression[];
}

