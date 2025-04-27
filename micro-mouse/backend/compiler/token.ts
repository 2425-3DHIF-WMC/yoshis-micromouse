export enum TokenType {
    Illegal,
    Eof,

    Ident,
    Number,

    Fun,
    If,
    Else,
    While,
    Return,
    Break,
    Continue,
    Void,
    Const,
    Let,

    Plus,
    Minus,
    Mul,
    Div,
    Mod,

    Eq,
    Neq,
    Lt,
    Leq,
    Rt,
    Req,
    And,
    Or,

    Lparen,
    Rparen,
    Lbrace,
    Rbrace,
    Assign,
    Semicolon,
    Comma,
}

export class Token {
    private readonly type: TokenType;
    private Literal: string;

    public constructor(type: TokenType, Literal: string) {
        this.type = type;
        this.Literal = Literal;
    }

    public get getType(): TokenType {
        return this.type;
    }

    public get getLiteral(): string {
        return this.Literal;
    }

    public static LookUpIdent(ident: string): TokenType {
        switch (ident) {
            case 'fun':
                return TokenType.Fun;
            case 'if':
                return TokenType.If;
            case 'else':
                return TokenType.Else;
            case 'while':
                return TokenType.While;
            case 'return':
                return TokenType.Return;
            case 'break':
                return TokenType.Break;
            case 'continue':
                return TokenType.Continue;
            case 'void':
                return TokenType.Void;
            case 'const':
                return TokenType.Const;
            case 'let':
                return TokenType.Let;
            default:
                return TokenType.Ident;
        }
    }
}