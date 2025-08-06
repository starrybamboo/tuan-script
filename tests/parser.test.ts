import { ANTLRInputStream, CommonTokenStream } from 'antlr4ts';
import { DicenicLexer } from '../src/generated/DicenicLexer';
import { DicenicParser } from '../src/generated/DicenicParser';

describe('Dicenic Parser Generation Tests', () => {
  describe('Lexer Tests', () => {
    test('should tokenize numbers correctly', () => {
      const input = '123 45.67';
      const inputStream = new ANTLRInputStream(input);
      const lexer = new DicenicLexer(inputStream);
      const tokens = lexer.getAllTokens();
      
      // Filter out EOF token for testing
      const nonEofTokens = tokens.filter(t => t.type !== -1);
      expect(nonEofTokens).toHaveLength(2);
      expect(nonEofTokens[0].type).toBe(DicenicLexer.NUMBER);
      expect(nonEofTokens[0].text).toBe('123');
      expect(nonEofTokens[1].type).toBe(DicenicLexer.NUMBER);
      expect(nonEofTokens[1].text).toBe('45.67');
    });

    test('should tokenize strings correctly', () => {
      const input = '"hello" \'world\'';
      const inputStream = new ANTLRInputStream(input);
      const lexer = new DicenicLexer(inputStream);
      const tokens = lexer.getAllTokens();
      
      const nonEofTokens = tokens.filter(t => t.type !== -1);
      expect(nonEofTokens).toHaveLength(2);
      expect(nonEofTokens[0].type).toBe(DicenicLexer.STRING);
      expect(nonEofTokens[0].text).toBe('"hello"');
      expect(nonEofTokens[1].type).toBe(DicenicLexer.STRING);
      expect(nonEofTokens[1].text).toBe("'world'");
    });

    test('should tokenize dice expressions correctly', () => {
      const input = '3d6 1D20';
      const inputStream = new ANTLRInputStream(input);
      const lexer = new DicenicLexer(inputStream);
      const tokens = lexer.getAllTokens();
      
      const nonEofTokens = tokens.filter(t => t.type !== -1);
      expect(nonEofTokens).toHaveLength(2);
      expect(nonEofTokens[0].type).toBe(DicenicLexer.DICE);
      expect(nonEofTokens[0].text).toBe('3d6');
      expect(nonEofTokens[1].type).toBe(DicenicLexer.DICE);
      expect(nonEofTokens[1].text).toBe('1D20');
    });

    test('should tokenize special variables correctly', () => {
      const input = '$a力量 $r姓名 $s时间 $d骰娘';
      const inputStream = new ANTLRInputStream(input);
      const lexer = new DicenicLexer(inputStream);
      const tokens = lexer.getAllTokens();
      
      const nonEofTokens = tokens.filter(t => t.type !== -1);
      expect(nonEofTokens).toHaveLength(4);
      expect(nonEofTokens[0].type).toBe(DicenicLexer.SPECIAL_VAR);
      expect(nonEofTokens[0].text).toBe('$a力量');
      expect(nonEofTokens[1].type).toBe(DicenicLexer.SPECIAL_VAR);
      expect(nonEofTokens[1].text).toBe('$r姓名');
      expect(nonEofTokens[2].type).toBe(DicenicLexer.SPECIAL_VAR);
      expect(nonEofTokens[2].text).toBe('$s时间');
      expect(nonEofTokens[3].type).toBe(DicenicLexer.SPECIAL_VAR);
      expect(nonEofTokens[3].text).toBe('$d骰娘');
    });

    test('should tokenize operators correctly', () => {
      const input = '+ - * / % == != < > <= >= && || !';
      const inputStream = new ANTLRInputStream(input);
      const lexer = new DicenicLexer(inputStream);
      const tokens = lexer.getAllTokens();
      
      const nonEofTokens = tokens.filter(t => t.type !== -1);
      expect(nonEofTokens.length).toBeGreaterThanOrEqual(13);
      
      // Check that all expected operator types are present
      const tokenTypes = nonEofTokens.map(t => t.type);
      expect(tokenTypes).toContain(DicenicLexer.PLUS);
      expect(tokenTypes).toContain(DicenicLexer.MINUS);
      expect(tokenTypes).toContain(DicenicLexer.MULTIPLY);
      expect(tokenTypes).toContain(DicenicLexer.DIVIDE);
      expect(tokenTypes).toContain(DicenicLexer.MODULO);
      expect(tokenTypes).toContain(DicenicLexer.EQUAL);
      expect(tokenTypes).toContain(DicenicLexer.NOT_EQUAL);
      expect(tokenTypes).toContain(DicenicLexer.LESS_THAN);
      expect(tokenTypes).toContain(DicenicLexer.GREATER_THAN);
      expect(tokenTypes).toContain(DicenicLexer.LESS_EQUAL);
      expect(tokenTypes).toContain(DicenicLexer.GREATER_EQUAL);
      expect(tokenTypes).toContain(DicenicLexer.LOGICAL_AND);
      expect(tokenTypes).toContain(DicenicLexer.LOGICAL_OR);
      expect(tokenTypes).toContain(DicenicLexer.LOGICAL_NOT);
    });

    test('should tokenize identifiers correctly', () => {
      const input = 'variable 变量名 _test test123';
      const inputStream = new ANTLRInputStream(input);
      const lexer = new DicenicLexer(inputStream);
      const tokens = lexer.getAllTokens();
      
      const nonEofTokens = tokens.filter(t => t.type !== -1);
      expect(nonEofTokens).toHaveLength(4);
      expect(nonEofTokens[0].type).toBe(DicenicLexer.IDENTIFIER);
      expect(nonEofTokens[0].text).toBe('variable');
      expect(nonEofTokens[1].type).toBe(DicenicLexer.IDENTIFIER);
      expect(nonEofTokens[1].text).toBe('变量名');
      expect(nonEofTokens[2].type).toBe(DicenicLexer.IDENTIFIER);
      expect(nonEofTokens[2].text).toBe('_test');
      expect(nonEofTokens[3].type).toBe(DicenicLexer.IDENTIFIER);
      expect(nonEofTokens[3].text).toBe('test123');
    });
  });

  describe('Parser Tests', () => {
    function createParser(input: string): DicenicParser {
      const inputStream = new ANTLRInputStream(input);
      const lexer = new DicenicLexer(inputStream);
      const tokenStream = new CommonTokenStream(lexer);
      return new DicenicParser(tokenStream);
    }

    test('should parse simple arithmetic expression', () => {
      const parser = createParser('1 + 2 * 3');
      const tree = parser.program();
      
      expect(tree).toBeDefined();
      expect(tree.statement()).toHaveLength(1);
      expect(parser.numberOfSyntaxErrors).toBe(0);
    });

    test('should parse assignment expression', () => {
      const parser = createParser('x = 10');
      const tree = parser.program();
      
      expect(tree).toBeDefined();
      expect(tree.statement()).toHaveLength(1);
      expect(parser.numberOfSyntaxErrors).toBe(0);
    });

    test('should parse if statement', () => {
      const parser = createParser('if (x > 5) { y = 10 }');
      const tree = parser.program();
      
      expect(tree).toBeDefined();
      expect(tree.statement().length).toBeGreaterThan(0);
      expect(parser.numberOfSyntaxErrors).toBe(0);
    });

    test('should parse while statement', () => {
      const parser = createParser('while (x < 10) { x = x + 1 }');
      const tree = parser.program();
      
      expect(tree).toBeDefined();
      expect(tree.statement().length).toBeGreaterThan(0);
      expect(parser.numberOfSyntaxErrors).toBe(0);
    });

    test('should parse ternary expression', () => {
      const parser = createParser('x > 5 ? "big" : "small"');
      const tree = parser.program();
      
      expect(tree).toBeDefined();
      expect(tree.statement()).toHaveLength(1);
      expect(parser.numberOfSyntaxErrors).toBe(0);
    });

    test('should parse dice expression', () => {
      const parser = createParser('3d6');
      const tree = parser.program();
      
      expect(tree).toBeDefined();
      expect(tree.statement()).toHaveLength(1);
      expect(parser.numberOfSyntaxErrors).toBe(0);
    });

    test('should parse special variables', () => {
      const parser = createParser('$a力量 + $r等级');
      const tree = parser.program();
      
      expect(tree).toBeDefined();
      expect(tree.statement()).toHaveLength(1);
      expect(parser.numberOfSyntaxErrors).toBe(0);
    });

    test('should parse complex expression', () => {
      const parser = createParser('if ($a力量 > 15) { result = 3d6 + $a力量 } else { result = 1d6 }');
      const tree = parser.program();
      
      expect(tree).toBeDefined();
      expect(tree.statement().length).toBeGreaterThan(0);
      expect(parser.numberOfSyntaxErrors).toBe(0);
    });

    test('should parse multiple statements', () => {
      const parser = createParser(`
        x = 10
        y = 20
        if (x > y) {
          result = "x is bigger"
        } else {
          result = "y is bigger"
        }
      `);
      const tree = parser.program();
      
      expect(tree).toBeDefined();
      expect(tree.statement().length).toBeGreaterThan(2);
      expect(parser.numberOfSyntaxErrors).toBe(0);
    });
  });

  describe('Error Handling Tests', () => {
    function createParser(input: string): DicenicParser {
      const inputStream = new ANTLRInputStream(input);
      const lexer = new DicenicLexer(inputStream);
      const tokenStream = new CommonTokenStream(lexer);
      return new DicenicParser(tokenStream);
    }

    test('should handle syntax errors gracefully', () => {
      const parser = createParser('if (x >'); // Incomplete if statement
      const tree = parser.program();
      
      expect(tree).toBeDefined();
      // The parser should still create a tree, but with errors
      expect(parser.numberOfSyntaxErrors).toBeGreaterThan(0);
    });

    test('should handle incomplete expressions', () => {
      const parser = createParser('if (x >'); // Incomplete if statement
      const tree = parser.program();
      
      expect(tree).toBeDefined();
      expect(parser.numberOfSyntaxErrors).toBeGreaterThan(0);
    });

    test('should handle unmatched parentheses', () => {
      const parser = createParser('(1 + 2'); // Unmatched parenthesis
      const tree = parser.program();
      
      expect(tree).toBeDefined();
      expect(parser.numberOfSyntaxErrors).toBeGreaterThan(0);
    });
  });
});