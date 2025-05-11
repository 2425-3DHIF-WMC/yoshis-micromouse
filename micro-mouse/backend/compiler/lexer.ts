import { Token, TokenType, keywords, symbols, operators } from "./token";

export class Lexer {
  private source: string;
  private pos = 0;
  private line = 1;
  private column = 1;

  constructor(source: string) {
    this.source = source;
  }

  public tokenize(): Token[] {
    const tokens: Token[] = [];

    while (!this.isAtEnd()) {
      this.skipWhitespaceAndComments();

      if (this.isAtEnd()) break;

      const startLine = this.line;
      const startCol = this.column;

      const char = this.peek();

      if (this.isAlpha(char)) {
        const word = this.consumeWhile(this.isAlphaNumeric);
        const type = keywords.has(word)
          ? (word === "true" || word === "false" ? TokenType.Boolean : TokenType.Keyword)
          : TokenType.Identifier;
        tokens.push({ type, value: word, line: startLine, column: startCol });

      } else if (this.isDigit(char)) {
        const num = this.matchFloat();
        tokens.push({ type: TokenType.Number, value: num, line: startLine, column: startCol });

      } else if (this.matchOperator(tokens, startLine, startCol)) {
        // matched operator

      } else if (symbols.has(char)) {
        tokens.push({ type: TokenType.Symbol, value: char, line: startLine, column: startCol });
        this.advance();

      } else {
        throw new Error(`Unexpected character '${char}' at ${startLine}:${startCol}`);
      }
    }

    tokens.push({ type: TokenType.EOF, value: "", line: this.line, column: this.column });
    return tokens;
  }

  private matchFloat(): string {
    let num = this.consumeWhile(this.isDigit);
    if (this.peek() === "." && this.isDigit(this.peekNext())) {
      num += this.advance(); // '.'
      num += this.consumeWhile(this.isDigit);
    }
    return num;
  }

  private matchOperator(tokens: Token[], line: number, column: number): boolean {
    for (const op of operators) {
      if (this.source.startsWith(op, this.pos)) {
        tokens.push({ type: TokenType.Operator, value: op, line, column });
        this.pos += op.length;
        this.column += op.length;
        return true;
      }
    }
    return false;
  }

  private skipWhitespaceAndComments(): void {
    while (!this.isAtEnd()) {
      const c = this.peek();
      if (c === " " || c === "\t" || c === "\r") {
        this.advance();
      } else if (c === "\n") {
        this.advance();
        this.line++;
        this.column = 1;
      } else if (c === "/" && this.peekNext() === "/") {
        while (!this.isAtEnd() && this.peek() !== "\n") {
          this.advance();
        }
      } else {
        break;
      }
    }
  }

  private consumeWhile(condition: (char: string) => boolean): string {
    let result = "";
    while (!this.isAtEnd() && condition.call(this, this.peek())) {
      result += this.advance();
    }
    return result;
  }

  private peek(): string {
    return this.source[this.pos] || "\0";
  }

  private peekNext(): string {
    return this.source[this.pos + 1] || "\0";
  }

  private advance(): string {
    const char = this.source[this.pos++];
    this.column++;
    return char;
  }

  private isAtEnd(): boolean {
    return this.pos >= this.source.length;
  }

  private isAlpha(char: string): boolean {
    return /[a-zA-Z_]/.test(char);
  }

  private isDigit(char: string): boolean {
    return /[0-9]/.test(char);
  }

  private isAlphaNumeric(char: string): boolean {
    return /[a-zA-Z0-9_]/.test(char);
  }
}

