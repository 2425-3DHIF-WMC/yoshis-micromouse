export enum TokenType {
  Identifier = "Identifier",
  Number = "Number",
  Boolean = "Boolean",
  Keyword = "Keyword",
  Operator = "Operator",
  Symbol = "Symbol",
  EOF = "EOF",
}

export interface Token {
  type: TokenType;
  value: string;
  line: number;
  column: number;
}

export const keywords = new Set([
  "int", "float", "bool", "void", "func",
  "if", "else", "while", "return",
  "true", "false"
]);

export const operators = [
  "==", "!=", "<=", ">=", "&&", "||",
  "+", "-", "*", "/", "%", "<", ">", "=", "!",
];

export const symbols = new Set(["(", ")", "{", "}", ",", ";"]);
