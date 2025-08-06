import { ANTLRInputStream, CommonTokenStream } from 'antlr4ts';
import { DicenicLexer } from './generated/DicenicLexer';
import { DicenicParser } from './generated/DicenicParser';

/**
 * Simple verification script to demonstrate the generated parser works
 */
function verifyParser() {
  console.log('🎲 Dicenic Parser Verification\n');

  const testCases = [
    '1 + 2 * 3',
    'x = 10',
    '$a力量 + $r等级',
    '3d6',
    'if (x > 5) { y = 10 }',
    'x > 5 ? "big" : "small"',
    'while (x < 10) { x = x + 1 }'
  ];

  testCases.forEach((input, index) => {
    console.log(`Test ${index + 1}: ${input}`);
    
    try {
      const inputStream = new ANTLRInputStream(input);
      const lexer = new DicenicLexer(inputStream);
      const tokenStream = new CommonTokenStream(lexer);
      const parser = new DicenicParser(tokenStream);
      
      const tree = parser.program();
      
      if (parser.numberOfSyntaxErrors === 0) {
        console.log('  ✅ Parsed successfully');
        console.log(`  📊 Statements: ${tree.statement().length}`);
      } else {
        console.log(`  ❌ Syntax errors: ${parser.numberOfSyntaxErrors}`);
      }
    } catch (error) {
      console.log(`  💥 Error: ${error instanceof Error ? error.message : String(error)}`);
    }
    
    console.log('');
  });

  console.log('✨ Parser verification complete!');
}

// Run verification if this file is executed directly
if (require.main === module) {
  verifyParser();
}

export { verifyParser };