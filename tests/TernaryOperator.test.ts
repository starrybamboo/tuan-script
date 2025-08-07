/**
 * 三元运算符测试
 * 测试条件运算符 condition ? trueValue : falseValue
 */

import { DicenicInterpreter } from '../src/interpreter/DicenicInterpreter';
import { ExecutionContext } from '../src/interpreter/ExecutionContext';
import { VariableType } from '../src/interpreter/types';
import { DicenicLexer } from '../src/generated/DicenicLexer';
import { DicenicParser } from '../src/generated/DicenicParser';
import { CharStreams, CommonTokenStream } from 'antlr4ts';

describe('三元运算符测试', () => {
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

  describe('基本三元运算符', () => {
    test('true条件应该返回第一个值', () => {
      const result = executeScript('1 > 0 ? "yes" : "no"');
      expect(result).toBe('yes');
    });

    test('false条件应该返回第二个值', () => {
      const result = executeScript('1 < 0 ? "yes" : "no"');
      expect(result).toBe('no');
    });

    test('数字条件：非零为true', () => {
      const result = executeScript('5 ? "true" : "false"');
      expect(result).toBe('true');
    });

    test('数字条件：零为false', () => {
      const result = executeScript('0 ? "true" : "false"');
      expect(result).toBe('false');
    });

    test('字符串条件：非空为true', () => {
      const result = executeScript('"hello" ? "true" : "false"');
      expect(result).toBe('true');
    });

    test('字符串条件：空字符串为false', () => {
      const result = executeScript('"" ? "true" : "false"');
      expect(result).toBe('false');
    });
  });

  describe('数值三元运算符', () => {
    test('应该正确返回数字值', () => {
      const result = executeScript('3 > 2 ? 100 : 200');
      expect(result).toBe('100');
    });

    test('应该正确返回计算表达式的结果', () => {
      const result = executeScript('5 > 3 ? 2 + 3 : 4 * 5');
      expect(result).toBe('5');
    });

    test('应该正确处理负数', () => {
      const result = executeScript('1 < 2 ? -10 : 10');
      expect(result).toBe('-10');
    });

    test('应该正确处理小数', () => {
      const result = executeScript('1 > 0 ? 3.14 : 2.71');
      expect(result).toBe('3.14');
    });
  });

  describe('变量三元运算符', () => {
    beforeEach(() => {
      context.setVariable('x', { type: VariableType.NUMBER, value: 10 });
      context.setVariable('y', { type: VariableType.NUMBER, value: 5 });
      context.setVariable('name', { type: VariableType.STRING, value: 'Alice' });
    });

    test('应该正确使用变量作为条件', () => {
      const result = executeScript('x > y ? "x is greater" : "y is greater"');
      expect(result).toBe('x is greater');
    });

    test('应该正确返回变量值', () => {
      const result = executeScript('x > 0 ? name : "unknown"');
      expect(result).toBe('Alice');
    });

    test('应该正确处理变量运算', () => {
      const result = executeScript('x > y ? x + y : x - y');
      expect(result).toBe('15');
    });

    test('应该正确处理变量比较', () => {
      const result = executeScript('x == 10 ? y * 2 : y / 2');
      expect(result).toBe('10');
    });
  });

  describe('特殊变量三元运算符', () => {
    beforeEach(() => {
      context.setSpecialVariable('a', '力量', { type: VariableType.NUMBER, value: 15 });
      context.setSpecialVariable('a', '敏捷', { type: VariableType.NUMBER, value: 12 });
      context.setSpecialVariable('d', '昵称', { type: VariableType.STRING, value: '小骰子' });
    });

    test('应该正确使用特殊变量作为条件', () => {
      const result = executeScript('$a力量 > $a敏捷 ? "力量更高" : "敏捷更高"');
      expect(result).toBe('力量更高');
    });

    test('应该正确返回特殊变量值', () => {
      const result = executeScript('$a力量 > 10 ? $d昵称 : "未知"');
      expect(result).toBe('小骰子');
    });

    test('应该正确处理特殊变量运算', () => {
      const result = executeScript('$a力量 > $a敏捷 ? $a力量 + $a敏捷 : $a力量 - $a敏捷');
      expect(result).toBe('27');
    });
  });

  describe('嵌套三元运算符', () => {
    test('应该正确处理嵌套的三元运算符', () => {
      const result = executeScript('5 > 3 ? (2 > 1 ? "nested true" : "nested false") : "outer false"');
      expect(result).toBe('nested true');
    });

    test('应该正确处理多层嵌套', () => {
      const result = executeScript('1 > 0 ? (2 > 3 ? "inner true" : (4 > 3 ? "deep true" : "deep false")) : "outer false"');
      expect(result).toBe('deep true');
    });

    test('应该正确处理条件中的三元运算符', () => {
      const result = executeScript('(5 > 3 ? 1 : 0) ? "condition true" : "condition false"');
      expect(result).toBe('condition true');
    });
  });

  describe('复杂表达式三元运算符', () => {
    test('应该正确处理算术表达式作为条件', () => {
      const result = executeScript('2 + 3 > 4 ? "math true" : "math false"');
      expect(result).toBe('math true');
    });

    test('应该正确处理逻辑表达式作为条件', () => {
      const result = executeScript('1 && 0 ? "logic true" : "logic false"');
      expect(result).toBe('logic false');
    });

    test('应该正确处理比较表达式作为条件', () => {
      const result = executeScript('5 == 5 && 3 < 4 ? "comparison true" : "comparison false"');
      expect(result).toBe('comparison true');
    });

    test('应该正确处理复合条件', () => {
      const result = executeScript('(5 > 3) && (2 < 4) ? "compound true" : "compound false"');
      expect(result).toBe('compound true');
    });
  });

  describe('类型转换三元运算符', () => {
    test('应该正确处理字符串到数字的转换', () => {
      context.setVariable('strNum', { type: VariableType.STRING, value: '5' });
      const result = executeScript('strNum > 3 ? "string number works" : "conversion failed"');
      expect(result).toBe('string number works');
    });

    test('应该正确处理数字到字符串的转换', () => {
      const result = executeScript('5 > 3 ? 42 : "fallback"');
      expect(result).toBe('42');
    });

    test('应该正确处理混合类型比较', () => {
      const result = executeScript('5 == "5" ? "types match" : "types differ"');
      expect(result).toBe('types match');
    });
  });

  describe('短路求值', () => {
    test('true条件时不应该计算false分支', () => {
      // 这个测试验证短路求值，false分支包含会出错的表达式
      const result = executeScript('1 > 0 ? "success" : (1 / 0)');
      expect(result).toBe('success');
    });

    test('false条件时不应该计算true分支', () => {
      // 这个测试验证短路求值，true分支包含会出错的表达式
      const result = executeScript('1 < 0 ? (1 / 0) : "success"');
      expect(result).toBe('success');
    });
  });

  describe('掷骰表达式三元运算符', () => {
    test('应该正确处理掷骰表达式作为条件', () => {
      const result = executeScript('1d1 > 0 ? "dice works" : "dice failed"');
      expect(result).toBe('dice works');
    });

    test('应该正确返回掷骰表达式结果', () => {
      const result = executeScript('1 > 0 ? 1d1 : 2d1');
      expect(result).toBe('1'); // 1d1 总是返回1
    });

    test('应该正确处理掷骰表达式运算', () => {
      const result = executeScript('1d1 == 1 ? 1d1 + 5 : 1d1 - 5');
      expect(result).toBe('6'); // 1 + 5 = 6
    });
  });

  describe('运算符优先级', () => {
    test('三元运算符应该有正确的优先级', () => {
      const result = executeScript('2 + 3 > 4 ? 1 : 0 + 5');
      expect(result).toBe('1'); // (2 + 3 > 4) ? 1 : (0 + 5)
    });

    test('三元运算符应该低于逻辑或运算符', () => {
      const result = executeScript('0 || 1 ? "or works" : "or failed"');
      expect(result).toBe('or works');
    });

    test('三元运算符应该低于逻辑与运算符', () => {
      const result = executeScript('1 && 0 ? "and failed" : "and works"');
      expect(result).toBe('and works');
    });
  });

  describe('边界情况', () => {
    test('应该处理没有三元运算符的表达式', () => {
      const result = executeScript('5 + 3');
      expect(result).toBe('8');
    });

    test('应该处理空字符串条件', () => {
      const result = executeScript('"" ? "not empty" : "empty"');
      expect(result).toBe('empty');
    });

    test('应该处理零值条件', () => {
      const result = executeScript('0 ? "not zero" : "zero"');
      expect(result).toBe('zero');
    });

    test('应该处理未定义变量作为条件', () => {
      const result = executeScript('undefined_var ? "defined" : "undefined"');
      expect(result).toBe('undefined'); // 未定义变量默认为0，即false
    });
  });

  describe('需求验证', () => {
    test('需求4.2: 应该正确实现三元运算符', () => {
      // 基本三元运算符功能
      expect(executeScript('1 > 0 ? "yes" : "no"')).toBe('yes');
      expect(executeScript('1 < 0 ? "yes" : "no"')).toBe('no');
      
      // 条件表达式
      expect(executeScript('5 > 3 ? "greater" : "less"')).toBe('greater');
      expect(executeScript('2 < 1 ? "less" : "greater"')).toBe('greater');
      
      // 数值返回
      expect(executeScript('1 == 1 ? 100 : 200')).toBe('100');
      expect(executeScript('1 != 1 ? 100 : 200')).toBe('200');
    });

    test('应该实现条件分支逻辑', () => {
      context.setVariable('score', { type: VariableType.NUMBER, value: 85 });
      
      const result = executeScript('score >= 90 ? "A" : (score >= 80 ? "B" : (score >= 70 ? "C" : "D"))');
      expect(result).toBe('B');
    });

    test('应该确保只求值选中的分支', () => {
      // 通过避免除零错误来验证短路求值
      const result1 = executeScript('1 > 0 ? "safe" : (1 / 0)');
      expect(result1).toBe('safe');
      
      const result2 = executeScript('1 < 0 ? (1 / 0) : "safe"');
      expect(result2).toBe('safe');
    });
  });
});