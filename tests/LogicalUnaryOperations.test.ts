/**
 * 逻辑运算和一元运算测试
 */

import { ANTLRInputStream, CommonTokenStream } from 'antlr4ts';
import { DicenicLexer } from '../src/generated/DicenicLexer';
import { DicenicParser } from '../src/generated/DicenicParser';
import { DicenicInterpreter } from '../src/interpreter/DicenicInterpreter';
import { ExecutionContext } from '../src/interpreter/ExecutionContext';
import { VariableType } from '../src/interpreter/types';

describe('逻辑运算和一元运算测试', () => {
  let interpreter: DicenicInterpreter;
  let context: ExecutionContext;

  beforeEach(() => {
    context = new ExecutionContext();
    interpreter = new DicenicInterpreter(context);
  });

  /**
   * 解析并执行脚本
   */
  function executeScript(script: string): string {
    const inputStream = new ANTLRInputStream(script);
    const lexer = new DicenicLexer(inputStream);
    const tokenStream = new CommonTokenStream(lexer);
    const parser = new DicenicParser(tokenStream);
    
    const parseTree = parser.program();
    return interpreter.interpret(parseTree);
  }

  describe('逻辑或运算 (||)', () => {
    test('true || false 应该返回 true', () => {
      const result = executeScript('1 || 0');
      expect(result).toBe('1');
    });

    test('false || true 应该返回 true', () => {
      const result = executeScript('0 || 1');
      expect(result).toBe('1');
    });

    test('false || false 应该返回 false', () => {
      const result = executeScript('0 || 0');
      expect(result).toBe('0');
    });

    test('true || true 应该返回 true', () => {
      const result = executeScript('1 || 1');
      expect(result).toBe('1');
    });

    test('字符串逻辑或运算', () => {
      const result1 = executeScript('"hello" || ""');
      expect(result1).toBe('1');

      const result2 = executeScript('"" || "world"');
      expect(result2).toBe('1');

      const result3 = executeScript('"" || ""');
      expect(result3).toBe('0');
    });

    test('混合类型逻辑或运算', () => {
      const result1 = executeScript('5 || ""');
      expect(result1).toBe('1');

      const result2 = executeScript('0 || "test"');
      expect(result2).toBe('1');
    });

    test('短路求值 - 左操作数为true时不计算右操作数', () => {
      // 这个测试验证短路求值，虽然我们无法直接观察到副作用，
      // 但可以通过复杂表达式来验证逻辑正确性
      const result = executeScript('1 || (5 / 0)'); // 如果不短路，除零会有问题
      expect(result).toBe('1');
    });

    test('多个逻辑或运算', () => {
      const result1 = executeScript('0 || 0 || 1');
      expect(result1).toBe('1');

      const result2 = executeScript('0 || 0 || 0');
      expect(result2).toBe('0');

      const result3 = executeScript('1 || 0 || 0');
      expect(result3).toBe('1');
    });
  });

  describe('逻辑与运算 (&&)', () => {
    test('true && true 应该返回 true', () => {
      const result = executeScript('1 && 1');
      expect(result).toBe('1');
    });

    test('true && false 应该返回 false', () => {
      const result = executeScript('1 && 0');
      expect(result).toBe('0');
    });

    test('false && true 应该返回 false', () => {
      const result = executeScript('0 && 1');
      expect(result).toBe('0');
    });

    test('false && false 应该返回 false', () => {
      const result = executeScript('0 && 0');
      expect(result).toBe('0');
    });

    test('字符串逻辑与运算', () => {
      const result1 = executeScript('"hello" && "world"');
      expect(result1).toBe('1');

      const result2 = executeScript('"hello" && ""');
      expect(result2).toBe('0');

      const result3 = executeScript('"" && "world"');
      expect(result3).toBe('0');
    });

    test('混合类型逻辑与运算', () => {
      const result1 = executeScript('5 && "test"');
      expect(result1).toBe('1');

      const result2 = executeScript('0 && "test"');
      expect(result2).toBe('0');

      const result3 = executeScript('5 && ""');
      expect(result3).toBe('0');
    });

    test('短路求值 - 左操作数为false时不计算右操作数', () => {
      const result = executeScript('0 && (5 / 0)'); // 如果不短路，除零会有问题
      expect(result).toBe('0');
    });

    test('多个逻辑与运算', () => {
      const result1 = executeScript('1 && 1 && 1');
      expect(result1).toBe('1');

      const result2 = executeScript('1 && 1 && 0');
      expect(result2).toBe('0');

      const result3 = executeScript('0 && 1 && 1');
      expect(result3).toBe('0');
    });
  });

  describe('逻辑非运算 (!)', () => {
    test('!true 应该返回 false', () => {
      const result = executeScript('!1');
      expect(result).toBe('0');
    });

    test('!false 应该返回 true', () => {
      const result = executeScript('!0');
      expect(result).toBe('1');
    });

    test('字符串逻辑非运算', () => {
      const result1 = executeScript('!"hello"');
      expect(result1).toBe('0');

      const result2 = executeScript('!""');
      expect(result2).toBe('1');
    });

    test('数字逻辑非运算', () => {
      const result1 = executeScript('!5');
      expect(result1).toBe('0');

      const result2 = executeScript('!(-3)');
      expect(result2).toBe('0');

      const result3 = executeScript('!0');
      expect(result3).toBe('1');
    });

    test('双重逻辑非运算', () => {
      const result1 = executeScript('!!1');
      expect(result1).toBe('1');

      const result2 = executeScript('!!0');
      expect(result2).toBe('0');

      const result3 = executeScript('!!"hello"');
      expect(result3).toBe('1');
    });
  });

  describe('一元正号运算 (+)', () => {
    test('+数字 应该返回数字本身', () => {
      const result1 = executeScript('+5');
      expect(result1).toBe('5');

      const result2 = executeScript('+(-3)');
      expect(result2).toBe('-3');

      const result3 = executeScript('+0');
      expect(result3).toBe('0');
    });

    test('+字符串 应该转换为数字', () => {
      const result1 = executeScript('+"123"');
      expect(result1).toBe('123');

      const result2 = executeScript('+"45.67"');
      expect(result2).toBe('45.67');

      const result3 = executeScript('+"abc"');
      expect(result3).toBe('0'); // 无法转换的字符串返回0
    });
  });

  describe('一元负号运算 (-)', () => {
    test('-正数 应该返回负数', () => {
      const result1 = executeScript('-5');
      expect(result1).toBe('-5');

      const result2 = executeScript('-3.14');
      expect(result2).toBe('-3.14');
    });

    test('-负数 应该返回正数', () => {
      const result = executeScript('-(-5)');
      expect(result).toBe('5');
    });

    test('-零 应该返回零', () => {
      const result = executeScript('-0');
      expect(result).toBe('0');
    });

    test('-字符串 应该转换为数字后取负', () => {
      const result1 = executeScript('-"123"');
      expect(result1).toBe('-123');

      const result2 = executeScript('-"45.67"');
      expect(result2).toBe('-45.67');

      const result3 = executeScript('-"abc"');
      expect(result3).toBe('0'); // 无法转换的字符串转换为0，-0还是0
    });
  });

  describe('复合逻辑运算', () => {
    test('逻辑运算符优先级', () => {
      // && 优先级高于 ||
      const result1 = executeScript('1 || 0 && 0');
      expect(result1).toBe('1'); // 相当于 1 || (0 && 0)

      const result2 = executeScript('0 && 1 || 1');
      expect(result2).toBe('1'); // 相当于 (0 && 1) || 1
    });

    test('逻辑运算与比较运算结合', () => {
      const result1 = executeScript('5 > 3 && 2 < 4');
      expect(result1).toBe('1');

      const result2 = executeScript('5 > 3 || 2 > 4');
      expect(result2).toBe('1');

      const result3 = executeScript('5 < 3 && 2 < 4');
      expect(result3).toBe('0');
    });

    test('一元运算与逻辑运算结合', () => {
      const result1 = executeScript('!0 && !0');
      expect(result1).toBe('1');

      const result2 = executeScript('!1 || !0');
      expect(result2).toBe('1');

      const result3 = executeScript('!1 && !0');
      expect(result3).toBe('0');
    });

    test('复杂的逻辑表达式', () => {
      const result1 = executeScript('!(1 && 0) || (1 || 0)');
      expect(result1).toBe('1');

      const result2 = executeScript('(1 || 0) && !(0 || 0)');
      expect(result2).toBe('1');
    });
  });

  describe('与变量结合的逻辑运算', () => {
    test('使用普通变量的逻辑运算', () => {
      // 设置变量
      context.setVariable('a', { type: VariableType.NUMBER, value: 1 });
      context.setVariable('b', { type: VariableType.NUMBER, value: 0 });
      context.setVariable('c', { type: VariableType.STRING, value: 'hello' });

      const result1 = executeScript('a && b');
      expect(result1).toBe('0');

      const result2 = executeScript('a || b');
      expect(result2).toBe('1');

      const result3 = executeScript('!a');
      expect(result3).toBe('0');

      const result4 = executeScript('c && a');
      expect(result4).toBe('1');
    });

    test('使用特殊变量的逻辑运算', () => {
      // 设置特殊变量
      context.setSpecialVariable('a', 'power', { type: VariableType.NUMBER, value: 15 });
      context.setSpecialVariable('a', 'health', { type: VariableType.NUMBER, value: 0 });

      const result1 = executeScript('$apower && $ahealth');
      expect(result1).toBe('0');

      const result2 = executeScript('$apower || $ahealth');
      expect(result2).toBe('1');

      const result3 = executeScript('!$ahealth');
      expect(result3).toBe('1');
    });
  });
});