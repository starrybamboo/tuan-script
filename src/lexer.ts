import { Token, TokenType } from './types';

/**
 * 词法分析器
 */
export class Lexer {
  private input: string;
  private position: number = 0;
  private line: number = 1;
  private column: number = 1;

  constructor(input: string) {
    this.input = input;
  }

  /**
   * 获取下一个 token
   */
  nextToken(): Token {
    this.skipWhitespace();

    if (this.position >= this.input.length) {
      return this.createToken(TokenType.EOF, '');
    }

    const char = this.currentChar();

    // 换行符
    if (char === '\n') {
      const token = this.createToken(TokenType.NEWLINE, char);
      this.advance();
      this.line++;
      this.column = 1;
      return token;
    }

    // 数字
    if (this.isDigit(char)) {
      return this.readNumber();
    }

    // 字符串
    if (char === '"' || char === "'") {
      return this.readString();
    }

    // 特殊变量 $a, $r, $s, $d
    if (char === '$') {
      return this.readSpecialVariable();
    }

    // 标识符
    if (this.isAlpha(char) || char === '_') {
      return this.readIdentifier();
    }

    // 双字符运算符
    const twoChar = this.input.slice(this.position, this.position + 2);
    switch (twoChar) {
      case '+=':
        this.advance(2);
        return this.createToken(TokenType.PLUS_ASSIGN, twoChar);
      case '-=':
        this.advance(2);
        return this.createToken(TokenType.MINUS_ASSIGN, twoChar);
      case '*=':
        this.advance(2);
        return this.createToken(TokenType.MULTIPLY_ASSIGN, twoChar);
      case '/=':
        this.advance(2);
        return this.createToken(TokenType.DIVIDE_ASSIGN, twoChar);
      case '%=':
        this.advance(2);
        return this.createToken(TokenType.MODULO_ASSIGN, twoChar);
      case '==':
        this.advance(2);
        return this.createToken(TokenType.EQUAL, twoChar);
      case '!=':
        this.advance(2);
        return this.createToken(TokenType.NOT_EQUAL, twoChar);
      case '>=':
        this.advance(2);
        return this.createToken(TokenType.GREATER_EQUAL, twoChar);
      case '<=':
        this.advance(2);
        return this.createToken(TokenType.LESS_EQUAL, twoChar);
      case '&&':
        this.advance(2);
        return this.createToken(TokenType.AND, twoChar);
      case '||':
        this.advance(2);
        return this.createToken(TokenType.OR, twoChar);
    }

    // 单字符运算符和符号
    switch (char) {
      case '+':
        this.advance();
        return this.createToken(TokenType.PLUS, char);
      case '-':
        this.advance();
        return this.createToken(TokenType.MINUS, char);
      case '*':
        this.advance();
        return this.createToken(TokenType.MULTIPLY, char);
      case '/':
        this.advance();
        return this.createToken(TokenType.DIVIDE, char);
      case '%':
        this.advance();
        return this.createToken(TokenType.MODULO, char);
      case '=':
        this.advance();
        return this.createToken(TokenType.ASSIGN, char);
      case '>':
        this.advance();
        return this.createToken(TokenType.GREATER, char);
      case '<':
        this.advance();
        return this.createToken(TokenType.LESS, char);
      case '!':
        this.advance();
        return this.createToken(TokenType.NOT, char);
      case '(':
        this.advance();
        return this.createToken(TokenType.LEFT_PAREN, char);
      case ')':
        this.advance();
        return this.createToken(TokenType.RIGHT_PAREN, char);
      case '{':
        this.advance();
        return this.createToken(TokenType.LEFT_BRACE, char);
      case '}':
        this.advance();
        return this.createToken(TokenType.RIGHT_BRACE, char);
      case ';':
        this.advance();
        return this.createToken(TokenType.SEMICOLON, char);
      case '?':
        this.advance();
        return this.createToken(TokenType.QUESTION, char);
      case ':':
        this.advance();
        return this.createToken(TokenType.COLON, char);
      default:
        throw new Error(`Unexpected character: ${char} at line ${this.line}, column ${this.column}`);
    }
  }

  /**
   * 获取所有 tokens
   */
  tokenize(): Token[] {
    const tokens: Token[] = [];
    let token: Token;

    do {
      token = this.nextToken();
      if (token.type !== TokenType.NEWLINE) { // 跳过换行符
        tokens.push(token);
      }
    } while (token.type !== TokenType.EOF);

    return tokens;
  }

  private currentChar(): string {
    if (this.position >= this.input.length) {
      return '';
    }
    return this.input[this.position];
  }

  private peekChar(offset: number = 1): string {
    const pos = this.position + offset;
    if (pos >= this.input.length) {
      return '';
    }
    return this.input[pos];
  }

  private advance(count: number = 1): void {
    for (let i = 0; i < count; i++) {
      if (this.position < this.input.length) {
        this.position++;
        this.column++;
      }
    }
  }

  private skipWhitespace(): void {
    while (this.position < this.input.length) {
      const char = this.currentChar();
      if (char === ' ' || char === '\t' || char === '\r') {
        this.advance();
      } else {
        break;
      }
    }
  }

  private isDigit(char: string): boolean {
    return char >= '0' && char <= '9';
  }

  private isAlpha(char: string): boolean {
    return (char >= 'a' && char <= 'z') || 
           (char >= 'A' && char <= 'Z') || 
           /[\u4e00-\u9fa5]/.test(char); // 支持中文字符
  }

  private isAlphaNumeric(char: string): boolean {
    return this.isAlpha(char) || this.isDigit(char);
  }

  private readNumber(): Token {
    const start = this.position;
    const startColumn = this.column;

    while (this.isDigit(this.currentChar())) {
      this.advance();
    }

    // 处理小数
    if (this.currentChar() === '.' && this.isDigit(this.peekChar())) {
      this.advance(); // 跳过 '.'
      while (this.isDigit(this.currentChar())) {
        this.advance();
      }
    }

    // 检查是否是掷骰表达式 (数字d数字)
    if (this.currentChar() === 'd' || this.currentChar() === 'D') {
      this.advance(); // 跳过 'd'
      if (this.isDigit(this.currentChar())) {
        while (this.isDigit(this.currentChar())) {
          this.advance();
        }
        const value = this.input.slice(start, this.position);
        return this.createToken(TokenType.DICE_EXPRESSION, value, startColumn);
      } else {
        throw new Error(`Invalid dice expression at line ${this.line}, column ${this.column}`);
      }
    }

    const value = this.input.slice(start, this.position);
    return this.createToken(TokenType.NUMBER, value, startColumn);
  }

  private readString(): Token {
    const quote = this.currentChar();
    const startColumn = this.column;
    this.advance(); // 跳过开始引号

    let value = '';
    while (this.position < this.input.length && this.currentChar() !== quote) {
      const char = this.currentChar();
      if (char === '\\') {
        this.advance();
        const escaped = this.currentChar();
        switch (escaped) {
          case 'n':
            value += '\n';
            break;
          case 't':
            value += '\t';
            break;
          case 'r':
            value += '\r';
            break;
          case '\\':
            value += '\\';
            break;
          case '"':
            value += '"';
            break;
          case "'":
            value += "'";
            break;
          default:
            value += escaped;
        }
        this.advance();
      } else {
        value += char;
        this.advance();
      }
    }

    if (this.currentChar() !== quote) {
      throw new Error(`Unterminated string at line ${this.line}, column ${this.column}`);
    }

    this.advance(); // 跳过结束引号
    return this.createToken(TokenType.STRING, value, startColumn);
  }

  private readSpecialVariable(): Token {
    const startColumn = this.column;
    this.advance(); // 跳过 '$'

    const prefix = this.currentChar();
    if (prefix !== 'a' && prefix !== 'r' && prefix !== 's' && prefix !== 'd') {
      throw new Error(`Invalid special variable prefix: $${prefix} at line ${this.line}, column ${this.column}`);
    }

    this.advance(); // 跳过前缀

    let name = '';
    while (this.position < this.input.length && 
           (this.isAlphaNumeric(this.currentChar()) || this.currentChar() === '_')) {
      name += this.currentChar();
      this.advance();
    }

    const value = `$${prefix}${name}`;
    return this.createToken(TokenType.SPECIAL_VAR, value, startColumn);
  }

  private readIdentifier(): Token {
    const start = this.position;
    const startColumn = this.column;

    while (this.position < this.input.length && 
           (this.isAlphaNumeric(this.currentChar()) || this.currentChar() === '_')) {
      this.advance();
    }

    const value = this.input.slice(start, this.position);

    // 检查关键字
    let tokenType: TokenType;
    switch (value) {
      case 'if':
        tokenType = TokenType.IF;
        break;
      case 'else':
        tokenType = TokenType.ELSE;
        break;
      case 'while':
        tokenType = TokenType.WHILE;
        break;
      default:
        tokenType = TokenType.IDENTIFIER;
    }

    return this.createToken(tokenType, value, startColumn);
  }

  private createToken(type: TokenType, value: string, column?: number): Token {
    return {
      type,
      value,
      line: this.line,
      column: column || this.column - value.length,
    };
  }
}
