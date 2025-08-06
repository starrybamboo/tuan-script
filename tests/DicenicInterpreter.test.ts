/**
 * DicenicInterpreter 单元测试
 * 测试主解释器的基本功能
 */

import { DicenicInterpreter } from '../src/interpreter/DicenicInterpreter';
import { ExecutionContext } from '../src/interpreter/ExecutionContext';
import { VariableType } from '../src/interpreter/types';
import { DicenicLexer } from '../src/generated/DicenicLexer';
import { DicenicParser } from '../src/generated/DicenicParser';
import { ANTLRInputStream, CommonTokenStream } from 'antlr4ts';

describe('DicenicInterpreter', () => {
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
    const inputStream = new ANTLRInputStream(script);
    const lexer = new DicenicLexer(inputStream);
    const tokenStream = new CommonTokenStream(lexer);
    const parser = new DicenicParser(tokenStream);
    
    const parseTree = parser.program();
    return interpreter.interpret(parseTree);
  }

  describe('基本表达式解释', () => {
    test('应该正确解释数字字面量', () => {
      const result = executeScript('42');
      expect(result).toBe('42');
    });

    test('应该正确解释小数', () => {
      const result = executeScript('3.14');
      expect(result).toBe('3.14');
    });

    test('应该正确解释字符串字面量', () => {
      const result = executeScript('"Hello World"');
      expect(result).toBe('Hello World');
    });

    test('应该正确解释单引号字符串', () => {
      const result = executeScript("'Hello World'");
      expect(result).toBe('Hello World');
    });

    test('应该处理字符串中的转义字符', () => {
      const result = executeScript('"Hello \\"World\\""');
      expect(result).toBe('Hello "World"');
    });
  });

  describe('变量访问', () => {
    test('应该正确访问普通变量', () => {
      context.setVariable('test', { type: VariableType.STRING, value: 'Hello' });
      const result = executeScript('test');
      expect(result).toBe('Hello');
    });

    test('应该正确访问不存在的变量（返回默认值）', () => {
      const result = executeScript('nonexistent');
      expect(result).toBe('0');
    });

    test('应该正确访问特殊变量', () => {
      const initialData = {
        attributes: new Map([['力量', { type: VariableType.NUMBER, value: 15 }]])
      };
      const contextWithData = new ExecutionContext(initialData);
      const interpreterWithData = new DicenicInterpreter(contextWithData);
      
      const inputStream = new ANTLRInputStream('$a力量');
      const lexer = new DicenicLexer(inputStream);
      const tokenStream = new CommonTokenStream(lexer);
      const parser = new DicenicParser(tokenStream);
      
      const parseTree = parser.program();
      const result = interpreterWithData.interpret(parseTree);
      expect(result).toBe('15');
    });
  });

  describe('掷骰表达式', () => {
    test('应该正确解释掷骰表达式', () => {
      const result = executeScript('1d6');
      const numResult = parseInt(result);
      expect(numResult).toBeGreaterThanOrEqual(1);
      expect(numResult).toBeLessThanOrEqual(6);
    });

    test('应该正确解释多个骰子的表达式', () => {
      const result = executeScript('3d6');
      const numResult = parseInt(result);
      expect(numResult).toBeGreaterThanOrEqual(3);
      expect(numResult).toBeLessThanOrEqual(18);
    });

    test('应该正确解释大写D的掷骰表达式', () => {
      const result = executeScript('2D10');
      const numResult = parseInt(result);
      expect(numResult).toBeGreaterThanOrEqual(2);
      expect(numResult).toBeLessThanOrEqual(20);
    });
  });

  describe('字符串插值', () => {
    test('应该正确处理字符串插值', () => {
      context.setVariable('name', { type: VariableType.STRING, value: '张三' });
      const result = executeScript('"Hello {$name}!"');
      expect(result).toBe('Hello 张三!');
    });

    test('应该正确处理特殊变量插值', () => {
      const initialData = {
        attributes: new Map([['力量', { type: VariableType.NUMBER, value: 15 }]])
      };
      const contextWithData = new ExecutionContext(initialData);
      const interpreterWithData = new DicenicInterpreter(contextWithData);
      
      const inputStream = new ANTLRInputStream('"力量值：{$a力量}"');
      const lexer = new DicenicLexer(inputStream);
      const tokenStream = new CommonTokenStream(lexer);
      const parser = new DicenicParser(tokenStream);
      
      const parseTree = parser.program();
      const result = interpreterWithData.interpret(parseTree);
      expect(result).toBe('力量值：15');
    });
  });

  describe('多语句执行', () => {
    test('应该返回最后一个表达式的值', () => {
      const result = executeScript('42; "hello"; 3.14');
      expect(result).toBe('3.14');
    });

    test('应该正确处理空程序', () => {
      const result = executeScript('');
      expect(result).toBe('0');
    });
  });

  describe('解释器状态管理', () => {
    test('应该能够获取和设置执行上下文', () => {
      const newContext = new ExecutionContext();
      interpreter.setContext(newContext);
      expect(interpreter.getContext()).toBe(newContext);
    });

    test('应该能够获取最后执行的值', () => {
      executeScript('42');
      const lastValue = interpreter.getLastValue();
      expect(lastValue).toEqual({
        type: VariableType.NUMBER,
        value: 42
      });
    });

    test('应该正确跟踪最后值的变化', () => {
      executeScript('"hello"');
      let lastValue = interpreter.getLastValue();
      expect(lastValue.type).toBe(VariableType.STRING);
      expect(lastValue.value).toBe('hello');
      
      executeScript('123');
      lastValue = interpreter.getLastValue();
      expect(lastValue.type).toBe(VariableType.NUMBER);
      expect(lastValue.value).toBe(123);
    });
  });

  describe('错误处理', () => {
    test('应该处理无效的掷骰表达式', () => {
      // 这个测试可能需要根据语法分析器的行为调整
      // 如果语法分析器拒绝无效表达式，这里可能会抛出异常
      try {
        const result = executeScript('0d6'); // 无效的掷骰表达式
        // 如果没有抛出异常，应该返回默认值
        expect(result).toBe('0');
      } catch (error) {
        // 如果抛出异常，这也是可以接受的
        expect(error).toBeDefined();
      }
    });

    test('应该处理格式错误的特殊变量', () => {
      // 测试格式错误的特殊变量访问
      const result = executeScript('$'); // 不完整的特殊变量
      expect(result).toBe('0');
    });
  });

  describe('算术运算', () => {
    test('应该正确执行加法运算', () => {
      const result = executeScript('3 + 5');
      expect(result).toBe('8');
    });

    test('应该正确执行减法运算', () => {
      const result = executeScript('10 - 3');
      expect(result).toBe('7');
    });

    test('应该正确执行乘法运算', () => {
      const result = executeScript('4 * 6');
      expect(result).toBe('24');
    });

    test('应该正确执行除法运算', () => {
      const result = executeScript('15 / 3');
      expect(result).toBe('5');
    });

    test('应该正确执行取模运算', () => {
      const result = executeScript('17 % 5');
      expect(result).toBe('2');
    });

    test('应该处理除零错误', () => {
      const consoleSpy = jest.spyOn(console, 'warn').mockImplementation();
      const result = executeScript('10 / 0');
      expect(result).toBe('0');
      expect(consoleSpy).toHaveBeenCalledWith('Division by zero, returning 0');
      consoleSpy.mockRestore();
    });

    test('应该处理模零错误', () => {
      const consoleSpy = jest.spyOn(console, 'warn').mockImplementation();
      const result = executeScript('10 % 0');
      expect(result).toBe('0');
      expect(consoleSpy).toHaveBeenCalledWith('Modulo by zero, returning 0');
      consoleSpy.mockRestore();
    });

    test('应该正确处理复合算术表达式', () => {
      const result = executeScript('2 + 3 * 4');
      expect(result).toBe('14'); // 应该遵循运算符优先级
    });

    test('应该正确处理多个加法运算', () => {
      const result = executeScript('1 + 2 + 3 + 4');
      expect(result).toBe('10');
    });

    test('应该正确处理多个乘法运算', () => {
      const result = executeScript('2 * 3 * 4');
      expect(result).toBe('24');
    });

    test('应该正确处理小数运算', () => {
      const result = executeScript('3.5 + 2.5');
      expect(result).toBe('6');
    });
  });

  describe('比较运算', () => {
    test('应该正确执行大于比较', () => {
      let result = executeScript('5 > 3');
      expect(result).toBe('1'); // true转换为1
      
      result = executeScript('3 > 5');
      expect(result).toBe('0'); // false转换为0
    });

    test('应该正确执行小于比较', () => {
      let result = executeScript('3 < 5');
      expect(result).toBe('1');
      
      result = executeScript('5 < 3');
      expect(result).toBe('0');
    });

    test('应该正确执行大于等于比较', () => {
      let result = executeScript('5 >= 5');
      expect(result).toBe('1');
      
      result = executeScript('5 >= 3');
      expect(result).toBe('1');
      
      result = executeScript('3 >= 5');
      expect(result).toBe('0');
    });

    test('应该正确执行小于等于比较', () => {
      let result = executeScript('3 <= 5');
      expect(result).toBe('1');
      
      result = executeScript('5 <= 5');
      expect(result).toBe('1');
      
      result = executeScript('5 <= 3');
      expect(result).toBe('0');
    });

    test('应该正确执行相等比较', () => {
      let result = executeScript('5 == 5');
      expect(result).toBe('1');
      
      result = executeScript('5 == 3');
      expect(result).toBe('0');
    });

    test('应该正确执行不等比较', () => {
      let result = executeScript('5 != 3');
      expect(result).toBe('1');
      
      result = executeScript('5 != 5');
      expect(result).toBe('0');
    });

    test('应该正确处理字符串比较', () => {
      let result = executeScript('"hello" == "hello"');
      expect(result).toBe('1');
      
      result = executeScript('"hello" == "world"');
      expect(result).toBe('0');
      
      result = executeScript('"hello" != "world"');
      expect(result).toBe('1');
    });

    test('应该正确处理混合类型比较', () => {
      // 数字和字符串的相等性比较应该转换为字符串比较
      let result = executeScript('5 == "5"');
      expect(result).toBe('1');
      
      result = executeScript('5 == "hello"');
      expect(result).toBe('0');
    });

    test('应该正确处理多个比较运算', () => {
      let result = executeScript('1 < 2 < 3'); // 应该从左到右计算
      expect(result).toBe('1'); // (1 < 2) 为 1，1 < 3 为 true
    });
  });

  describe('运算符优先级', () => {
    test('乘法应该优先于加法', () => {
      const result = executeScript('2 + 3 * 4');
      expect(result).toBe('14'); // 2 + (3 * 4) = 14
    });

    test('除法应该优先于减法', () => {
      const result = executeScript('10 - 8 / 2');
      expect(result).toBe('6'); // 10 - (8 / 2) = 6
    });

    test('算术运算应该优先于比较运算', () => {
      const result = executeScript('2 + 3 > 4');
      expect(result).toBe('1'); // (2 + 3) > 4 = 5 > 4 = true
    });

    test('比较运算应该优先于相等性运算', () => {
      const result = executeScript('3 > 2 == 1');
      expect(result).toBe('1'); // (3 > 2) == 1 = 1 == 1 = true
    });
  });

  describe('类型转换', () => {
    test('算术运算应该将操作数转换为数字', () => {
      context.setVariable('strNum', { type: VariableType.STRING, value: '5' });
      const result = executeScript('strNum + 3');
      expect(result).toBe('8');
    });

    test('比较运算应该正确处理类型转换', () => {
      context.setVariable('strNum', { type: VariableType.STRING, value: '5' });
      const result = executeScript('strNum > 3');
      expect(result).toBe('1');
    });

    test('应该正确处理掷骰表达式的算术运算', () => {
      const result = executeScript('1d1 + 5'); // 1d1总是返回1
      expect(result).toBe('6');
    });
  });

  describe('需求验证', () => {
    test('需求3.1: 应该正确执行算术运算符', () => {
      expect(executeScript('2 + 3')).toBe('5');
      expect(executeScript('7 - 2')).toBe('5');
      expect(executeScript('3 * 4')).toBe('12');
      expect(executeScript('15 / 3')).toBe('5');
      expect(executeScript('17 % 5')).toBe('2');
    });

    test('需求3.3: 应该正确执行比较运算符', () => {
      expect(executeScript('5 == 5')).toBe('1');
      expect(executeScript('5 > 3')).toBe('1');
      expect(executeScript('3 < 5')).toBe('1');
      expect(executeScript('5 != 3')).toBe('1');
      expect(executeScript('5 >= 5')).toBe('1');
      expect(executeScript('3 <= 5')).toBe('1');
    });

    test('需求3.5: 应该在运算时进行隐式类型转换', () => {
      context.setVariable('strNum', { type: VariableType.STRING, value: '10' });
      expect(executeScript('strNum + 5')).toBe('15');
      expect(executeScript('strNum > 5')).toBe('1');
    });

    test('需求5.1: 应该获取最后出现的变量或字面量', () => {
      const result = executeScript('42; "hello"; 3.14');
      expect(result).toBe('3.14');
    });

    test('需求5.2: 应该将最后的值隐式转换为字符串', () => {
      const result = executeScript('42');
      expect(typeof result).toBe('string');
      expect(result).toBe('42');
    });

    test('需求5.3: 应该将结果作为脚本执行的最终输出', () => {
      const result = executeScript('"Final Result"');
      expect(result).toBe('Final Result');
    });

    test('应该支持中文变量名和内容', () => {
      context.setVariable('中文变量', { type: VariableType.STRING, value: '中文值' });
      const result = executeScript('中文变量');
      expect(result).toBe('中文值');
    });

    test('应该正确处理各种数据类型', () => {
      // 数字
      let result = executeScript('42');
      expect(result).toBe('42');
      
      // 字符串
      result = executeScript('"Hello"');
      expect(result).toBe('Hello');
      
      // 掷骰表达式
      result = executeScript('1d1'); // 确定结果
      expect(result).toBe('1');
    });
  });
});