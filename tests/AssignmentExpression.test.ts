/**
 * 赋值表达式测试
 * 测试基本赋值和复合赋值运算符
 */

import { DicenicInterpreter } from '../src/interpreter/DicenicInterpreter';
import { ExecutionContext } from '../src/interpreter/ExecutionContext';
import { VariableType } from '../src/interpreter/types';
import { DicenicLexer } from '../src/generated/DicenicLexer';
import { DicenicParser } from '../src/generated/DicenicParser';
import { CharStreams, CommonTokenStream } from 'antlr4ts';

describe('赋值表达式测试', () => {
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

  describe('基本赋值运算符 (=)', () => {
    test('应该正确执行普通变量的基本赋值', () => {
      const result = executeScript('x = 42');
      expect(result).toBe('42');
      
      // 验证变量已被正确赋值
      const varValue = context.getVariable('x');
      expect(varValue.type).toBe(VariableType.NUMBER);
      expect(varValue.value).toBe(42);
    });

    test('应该正确执行字符串赋值', () => {
      const result = executeScript('name = "Hello World"');
      expect(result).toBe('Hello World');
      
      const varValue = context.getVariable('name');
      expect(varValue.type).toBe(VariableType.STRING);
      expect(varValue.value).toBe('Hello World');
    });

    test('应该正确执行表达式赋值', () => {
      const result = executeScript('sum = 3 + 5');
      expect(result).toBe('8');
      
      const varValue = context.getVariable('sum');
      expect(varValue.type).toBe(VariableType.NUMBER);
      expect(varValue.value).toBe(8);
    });

    test('应该正确执行中文变量名赋值', () => {
      const result = executeScript('中文变量 = 100');
      expect(result).toBe('100');
      
      const varValue = context.getVariable('中文变量');
      expect(varValue.type).toBe(VariableType.NUMBER);
      expect(varValue.value).toBe(100);
    });
  });

  describe('复合赋值运算符', () => {
    beforeEach(() => {
      // 设置初始变量值
      context.setVariable('x', { type: VariableType.NUMBER, value: 10 });
      context.setVariable('y', { type: VariableType.NUMBER, value: 3 });
    });

    test('应该正确执行加法赋值 (+=)', () => {
      const result = executeScript('x += 5');
      expect(result).toBe('15');
      
      const varValue = context.getVariable('x');
      expect(varValue.type).toBe(VariableType.NUMBER);
      expect(varValue.value).toBe(15);
    });

    test('应该正确执行减法赋值 (-=)', () => {
      const result = executeScript('x -= 3');
      expect(result).toBe('7');
      
      const varValue = context.getVariable('x');
      expect(varValue.type).toBe(VariableType.NUMBER);
      expect(varValue.value).toBe(7);
    });

    test('应该正确执行乘法赋值 (*=)', () => {
      const result = executeScript('x *= 2');
      expect(result).toBe('20');
      
      const varValue = context.getVariable('x');
      expect(varValue.type).toBe(VariableType.NUMBER);
      expect(varValue.value).toBe(20);
    });

    test('应该正确执行除法赋值 (/=)', () => {
      const result = executeScript('x /= 2');
      expect(result).toBe('5');
      
      const varValue = context.getVariable('x');
      expect(varValue.type).toBe(VariableType.NUMBER);
      expect(varValue.value).toBe(5);
    });

    test('应该正确执行取模赋值 (%=)', () => {
      const result = executeScript('x %= 3');
      expect(result).toBe('1');
      
      const varValue = context.getVariable('x');
      expect(varValue.type).toBe(VariableType.NUMBER);
      expect(varValue.value).toBe(1);
    });

    test('应该正确执行复合赋值与变量的运算', () => {
      const result = executeScript('x += y');
      expect(result).toBe('13');
      
      const varValue = context.getVariable('x');
      expect(varValue.type).toBe(VariableType.NUMBER);
      expect(varValue.value).toBe(13);
    });

    test('应该正确执行复合赋值与表达式的运算', () => {
      const result = executeScript('x += 2 * 3');
      expect(result).toBe('16');
      
      const varValue = context.getVariable('x');
      expect(varValue.type).toBe(VariableType.NUMBER);
      expect(varValue.value).toBe(16);
    });
  });

  describe('特殊变量赋值', () => {
    test('应该正确执行角色卡属性变量赋值 ($a)', () => {
      const result = executeScript('$a力量 = 15');
      expect(result).toBe('15');
      
      const varValue = context.getSpecialVariable('a', '力量');
      expect(varValue.type).toBe(VariableType.NUMBER);
      expect(varValue.value).toBe(15);
    });

    test('应该正确执行骰娘信息变量赋值 ($d)', () => {
      const result = executeScript('$d昵称 = "小骰子"');
      expect(result).toBe('小骰子');
      
      const varValue = context.getSpecialVariable('d', '昵称');
      expect(varValue.type).toBe(VariableType.STRING);
      expect(varValue.value).toBe('小骰子');
    });

    test('应该正确执行特殊变量的复合赋值', () => {
      // 先设置初始值
      context.setSpecialVariable('a', '力量', { type: VariableType.NUMBER, value: 10 });
      
      const result = executeScript('$a力量 += 5');
      expect(result).toBe('15');
      
      const varValue = context.getSpecialVariable('a', '力量');
      expect(varValue.type).toBe(VariableType.NUMBER);
      expect(varValue.value).toBe(15);
    });

    test('应该拒绝对只读特殊变量的赋值 ($r)', () => {
      expect(() => {
        executeScript('$r角色名 = "测试角色"', { errorConfig: { enableRecovery: false } });
      }).toThrow('Cannot write to read-only variable');
    });

    test('应该拒绝对只读特殊变量的赋值 ($s)', () => {
      expect(() => {
        executeScript('$s系统版本 = "1.0"', { errorConfig: { enableRecovery: false } });
      }).toThrow('Cannot write to read-only variable');
    });
  });

  describe('类型转换和赋值', () => {
    test('应该正确处理字符串到数字的类型转换', () => {
      context.setVariable('strNum', { type: VariableType.STRING, value: '5' });
      
      const result = executeScript('x = strNum + 10');
      expect(result).toBe('15');
      
      const varValue = context.getVariable('x');
      expect(varValue.type).toBe(VariableType.NUMBER);
      expect(varValue.value).toBe(15);
    });

    test('应该正确处理复合赋值中的类型转换', () => {
      context.setVariable('x', { type: VariableType.STRING, value: '10' });
      
      const result = executeScript('x += 5');
      expect(result).toBe('15');
      
      const varValue = context.getVariable('x');
      expect(varValue.type).toBe(VariableType.NUMBER);
      expect(varValue.value).toBe(15);
    });
  });

  describe('连续赋值和表达式', () => {
    test('应该正确处理多个赋值语句', () => {
      const result = executeScript('x = 10; y = 20; z = x + y');
      expect(result).toBe('30');
      
      expect(context.getVariable('x').value).toBe(10);
      expect(context.getVariable('y').value).toBe(20);
      expect(context.getVariable('z').value).toBe(30);
    });

    test('应该返回最后一个赋值的结果', () => {
      const result = executeScript('x = 10; y = 20');
      expect(result).toBe('20');
    });

    test('应该正确处理赋值后的变量使用', () => {
      const result = executeScript('x = 5; x * 2');
      expect(result).toBe('10');
    });
  });

  describe('错误处理', () => {
    test('应该处理除零错误在复合赋值中', () => {
      context.setVariable('x', { type: VariableType.NUMBER, value: 10 });
      
      const consoleSpy = jest.spyOn(console, 'warn').mockImplementation();
      const result = executeScript('x /= 0');
      expect(result).toBe('0');
      expect(consoleSpy).toHaveBeenCalledWith('Division by zero, returning 0');
      consoleSpy.mockRestore();
    });

    test('应该处理模零错误在复合赋值中', () => {
      context.setVariable('x', { type: VariableType.NUMBER, value: 10 });
      
      const consoleSpy = jest.spyOn(console, 'warn').mockImplementation();
      const result = executeScript('x %= 0');
      expect(result).toBe('0');
      expect(consoleSpy).toHaveBeenCalledWith('Modulo by zero, returning 0');
      consoleSpy.mockRestore();
    });
  });

  describe('需求验证', () => {
    test('需求3.2: 应该正确执行复合赋值运算符', () => {
      context.setVariable('x', { type: VariableType.NUMBER, value: 10 });
      
      expect(executeScript('x += 5')).toBe('15');
      expect(context.getVariable('x').value).toBe(15);
      
      expect(executeScript('x -= 3')).toBe('12');
      expect(context.getVariable('x').value).toBe(12);
      
      expect(executeScript('x *= 2')).toBe('24');
      expect(context.getVariable('x').value).toBe(24);
      
      expect(executeScript('x /= 4')).toBe('6');
      expect(context.getVariable('x').value).toBe(6);
      
      expect(executeScript('x %= 4')).toBe('2');
      expect(context.getVariable('x').value).toBe(2);
    });

    test('需求2.1: 应该识别角色卡属性变量且支持读写操作', () => {
      const result = executeScript('$a力量 = 15');
      expect(result).toBe('15');
      
      const varValue = context.getSpecialVariable('a', '力量');
      expect(varValue.value).toBe(15);
      
      // 验证可以读取
      const readResult = executeScript('$a力量');
      expect(readResult).toBe('15');
    });

    test('需求2.4: 应该识别骰娘信息变量且支持读写操作', () => {
      const result = executeScript('$d昵称 = "小骰子"');
      expect(result).toBe('小骰子');
      
      const varValue = context.getSpecialVariable('d', '昵称');
      expect(varValue.value).toBe('小骰子');
      
      // 验证可以读取
      const readResult = executeScript('$d昵称');
      expect(readResult).toBe('小骰子');
    });
  });
});