/**
 * if-else语句测试
 * 测试条件判断和分支执行功能
 */

import { DicenicInterpreter } from '../src/interpreter/DicenicInterpreter';
import { ExecutionContext } from '../src/interpreter/ExecutionContext';
import { VariableType } from '../src/interpreter/types';
import { DicenicLexer } from '../src/generated/DicenicLexer';
import { DicenicParser } from '../src/generated/DicenicParser';
import { CharStreams, CommonTokenStream } from 'antlr4ts';

describe('if-else语句测试', () => {
  let interpreter: DicenicInterpreter;
  let context: ExecutionContext;

  beforeEach(() => {
    context = new ExecutionContext();
    interpreter = new DicenicInterpreter(context);
  });

  /**
   * 辅助函数：解析并执行脚本
   */
  function executeScript(script: string): string {
    const inputStream = CharStreams.fromString(script);
    const lexer = new DicenicLexer(inputStream);
    const tokenStream = new CommonTokenStream(lexer);
    const parser = new DicenicParser(tokenStream);
    
    const parseTree = parser.program();
    return interpreter.interpret(parseTree);
  }

  describe('基本if语句', () => {
    test('true条件应该执行if分支', () => {
      const result = executeScript('if (1 > 0) x = 10');
      expect(result).toBe('10');
      
      // 验证变量已被赋值
      const varValue = context.getVariable('x');
      expect(varValue.value).toBe(10);
    });

    test('false条件不应该执行if分支', () => {
      const result = executeScript('if (1 < 0) x = 10');
      expect(result).toBe('0'); // 默认返回值
      
      // 验证变量未被赋值（仍为默认值0）
      const varValue = context.getVariable('x');
      expect(varValue.value).toBe(0);
    });

    test('应该正确处理数字条件', () => {
      const result = executeScript('if (5) x = "non-zero"');
      expect(result).toBe('non-zero');
      
      const varValue = context.getVariable('x');
      expect(varValue.value).toBe('non-zero');
    });

    test('应该正确处理零值条件', () => {
      const result = executeScript('if (0) x = "zero"');
      expect(result).toBe('0'); // 默认返回值，因为条件为false
      
      const varValue = context.getVariable('x');
      expect(varValue.value).toBe(0); // 未被赋值
    });

    test('应该正确处理字符串条件', () => {
      const result = executeScript('if ("hello") x = "string"');
      expect(result).toBe('string');
      
      const varValue = context.getVariable('x');
      expect(varValue.value).toBe('string');
    });

    test('应该正确处理空字符串条件', () => {
      const result = executeScript('if ("") x = "empty"');
      expect(result).toBe('0'); // 默认返回值，因为空字符串为false
      
      const varValue = context.getVariable('x');
      expect(varValue.value).toBe(0); // 未被赋值
    });
  });

  describe('if-else语句', () => {
    test('true条件应该执行if分支', () => {
      const result = executeScript('if (1 > 0) x = "true" else x = "false"');
      expect(result).toBe('true');
      
      const varValue = context.getVariable('x');
      expect(varValue.value).toBe('true');
    });

    test('false条件应该执行else分支', () => {
      const result = executeScript('if (1 < 0) x = "true" else x = "false"');
      expect(result).toBe('false');
      
      const varValue = context.getVariable('x');
      expect(varValue.value).toBe('false');
    });

    test('应该正确处理数值返回', () => {
      const result = executeScript('if (5 > 3) 100 else 200');
      expect(result).toBe('100');
    });

    test('应该正确处理表达式条件', () => {
      const result = executeScript('if (2 + 3 > 4) "math works" else "math failed"');
      expect(result).toBe('math works');
    });

    test('应该正确处理逻辑表达式条件', () => {
      const result = executeScript('if (1 && 0) "and true" else "and false"');
      expect(result).toBe('and false');
    });
  });

  describe('变量条件if语句', () => {
    beforeEach(() => {
      context.setVariable('x', { type: VariableType.NUMBER, value: 10 });
      context.setVariable('y', { type: VariableType.NUMBER, value: 5 });
      context.setVariable('name', { type: VariableType.STRING, value: 'Alice' });
    });

    test('应该正确使用变量作为条件', () => {
      const result = executeScript('if (x > y) "x is greater" else "y is greater"');
      expect(result).toBe('x is greater');
    });

    test('应该正确处理变量相等比较', () => {
      const result = executeScript('if (x == 10) "correct" else "incorrect"');
      expect(result).toBe('correct');
    });

    test('应该正确处理字符串变量条件', () => {
      const result = executeScript('if (name) "has name" else "no name"');
      expect(result).toBe('has name');
    });

    test('应该正确在if分支中使用变量', () => {
      const result = executeScript('if (x > 0) name else "unknown"');
      expect(result).toBe('Alice');
    });
  });

  describe('特殊变量if语句', () => {
    beforeEach(() => {
      context.setSpecialVariable('a', '力量', { type: VariableType.NUMBER, value: 15 });
      context.setSpecialVariable('a', '敏捷', { type: VariableType.NUMBER, value: 12 });
      context.setSpecialVariable('d', '昵称', { type: VariableType.STRING, value: '小骰子' });
    });

    test('应该正确使用特殊变量作为条件', () => {
      const result = executeScript('if ($a力量 > $a敏捷) "力量更高" else "敏捷更高"');
      expect(result).toBe('力量更高');
    });

    test('应该正确在if分支中返回特殊变量', () => {
      const result = executeScript('if ($a力量 > 10) $d昵称 else "未知"');
      expect(result).toBe('小骰子');
    });

    test('应该正确在if分支中赋值特殊变量', () => {
      const result = executeScript('if ($a力量 > 10) $d昵称 = "强者" else $d昵称 = "弱者"');
      expect(result).toBe('强者');
      
      const varValue = context.getSpecialVariable('d', '昵称');
      expect(varValue.value).toBe('强者');
    });
  });

  describe('代码块if语句', () => {
    test('应该正确执行if代码块', () => {
      const result = executeScript('if (1 > 0) { x = 10; y = 20; x + y }');
      expect(result).toBe('30');
      
      expect(context.getVariable('x').value).toBe(10);
      expect(context.getVariable('y').value).toBe(20);
    });

    test('应该正确执行else代码块', () => {
      const result = executeScript('if (1 < 0) { x = 10 } else { x = 20; y = 30; x + y }');
      expect(result).toBe('50');
      
      expect(context.getVariable('x').value).toBe(20);
      expect(context.getVariable('y').value).toBe(30);
    });

    test('应该正确处理空代码块', () => {
      const result = executeScript('if (1 > 0) { } else { x = 10 }');
      expect(result).toBe('0'); // 空代码块返回默认值
      
      expect(context.getVariable('x').value).toBe(0); // 未执行else分支
    });

    test('应该正确处理多语句代码块', () => {
      const result = executeScript('if (1 > 0) { a = 1; b = 2; c = 3; a + b + c }');
      expect(result).toBe('6');
      
      expect(context.getVariable('a').value).toBe(1);
      expect(context.getVariable('b').value).toBe(2);
      expect(context.getVariable('c').value).toBe(3);
    });
  });

  describe('嵌套if语句', () => {
    test('应该正确处理嵌套if语句', () => {
      const result = executeScript('if (1 > 0) if (2 > 1) "nested true" else "nested false" else "outer false"');
      expect(result).toBe('nested true');
    });

    test('应该正确处理嵌套if-else语句', () => {
      const result = executeScript('if (1 > 0) { if (2 < 1) x = "inner true" else x = "inner false"; x } else "outer false"');
      expect(result).toBe('inner false');
      
      expect(context.getVariable('x').value).toBe('inner false');
    });

    test('应该正确处理多层嵌套', () => {
      const script = `
        if (1 > 0) {
          if (2 > 1) {
            if (3 > 2) "deep true" else "deep false"
          } else "middle false"
        } else "outer false"
      `;
      const result = executeScript(script);
      expect(result).toBe('deep true');
    });
  });

  describe('复杂条件if语句', () => {
    test('应该正确处理算术表达式条件', () => {
      const result = executeScript('if (2 + 3 * 4 > 10) "math true" else "math false"');
      expect(result).toBe('math true'); // 2 + 12 = 14 > 10
    });

    test('应该正确处理比较表达式条件', () => {
      const result = executeScript('if (5 == 5 && 3 < 4) "comparison true" else "comparison false"');
      expect(result).toBe('comparison true');
    });

    test('应该正确处理三元运算符条件', () => {
      const result = executeScript('if (5 > 3 ? 1 : 0) "ternary true" else "ternary false"');
      expect(result).toBe('ternary true');
    });

    test('应该正确处理复合逻辑条件', () => {
      const result = executeScript('if ((5 > 3) && (2 < 4) || (1 == 0)) "complex true" else "complex false"');
      expect(result).toBe('complex true');
    });
  });

  describe('掷骰表达式if语句', () => {
    test('应该正确处理掷骰表达式作为条件', () => {
      const result = executeScript('if (1d1 > 0) "dice works" else "dice failed"');
      expect(result).toBe('dice works'); // 1d1总是返回1
    });

    test('应该正确在if分支中返回掷骰表达式', () => {
      const result = executeScript('if (1 > 0) 1d1 else 2d1');
      expect(result).toBe('1'); // 1d1总是返回1
    });

    test('应该正确处理掷骰表达式运算条件', () => {
      const result = executeScript('if (1d1 + 5 > 5) "dice math works" else "dice math failed"');
      expect(result).toBe('dice math works'); // 1 + 5 = 6 > 5
    });
  });

  describe('类型转换if语句', () => {
    test('应该正确处理字符串到数字的转换', () => {
      context.setVariable('strNum', { type: VariableType.STRING, value: '5' });
      const result = executeScript('if (strNum > 3) "string number works" else "conversion failed"');
      expect(result).toBe('string number works');
    });

    test('应该正确处理数字到字符串的转换', () => {
      const result = executeScript('if (5 > 3) 42 else "fallback"');
      expect(result).toBe('42');
    });

    test('应该正确处理混合类型比较', () => {
      const result = executeScript('if (5 == "5") "types match" else "types differ"');
      expect(result).toBe('types match');
    });
  });

  describe('边界情况', () => {
    test('应该处理未定义变量作为条件', () => {
      const result = executeScript('if (undefined_var) "defined" else "undefined"');
      expect(result).toBe('undefined'); // 未定义变量默认为0，即false
    });

    test('应该处理复杂表达式作为分支', () => {
      const result = executeScript('if (1 > 0) (2 + 3) * 4 else 0');
      expect(result).toBe('20'); // (2 + 3) * 4 = 20
    });

    test('应该正确处理赋值表达式作为分支', () => {
      const result = executeScript('if (1 > 0) x = 10 else x = 20');
      expect(result).toBe('10');
      expect(context.getVariable('x').value).toBe(10);
    });

    test('应该正确处理连续if语句', () => {
      const result = executeScript('if (1 > 0) x = 10; if (x == 10) y = 20; y');
      expect(result).toBe('20');
      expect(context.getVariable('x').value).toBe(10);
      expect(context.getVariable('y').value).toBe(20);
    });
  });

  describe('需求验证', () => {
    test('需求4.1: 应该正确实现if-else语句', () => {
      // 基本if语句
      expect(executeScript('if (1 > 0) "yes" else "no"')).toBe('yes');
      expect(executeScript('if (1 < 0) "yes" else "no"')).toBe('no');
      
      // 条件判断
      expect(executeScript('if (5 > 3) "greater" else "less"')).toBe('greater');
      expect(executeScript('if (2 < 1) "less" else "greater"')).toBe('greater');
      
      // 分支执行
      expect(executeScript('if (1 == 1) 100 else 200')).toBe('100');
      expect(executeScript('if (1 != 1) 100 else 200')).toBe('200');
    });

    test('应该支持else分支', () => {
      const result1 = executeScript('if (0) "if branch" else "else branch"');
      expect(result1).toBe('else branch');
      
      const result2 = executeScript('if (1) "if branch" else "else branch"');
      expect(result2).toBe('if branch');
    });

    test('应该实现代码块的执行', () => {
      const result = executeScript('if (1 > 0) { x = 5; y = 10; x + y } else { 0 }');
      expect(result).toBe('15');
      expect(context.getVariable('x').value).toBe(5);
      expect(context.getVariable('y').value).toBe(10);
    });

    test('应该正确处理条件判断', () => {
      context.setVariable('score', { type: VariableType.NUMBER, value: 85 });
      
      const result = executeScript('if (score >= 90) "A" else if (score >= 80) "B" else "C"');
      expect(result).toBe('B');
    });
  });
});