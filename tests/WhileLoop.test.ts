/**
 * While循环语句测试
 * 测试while循环的条件判断、循环体执行和循环深度限制
 */

import { ANTLRInputStream, CommonTokenStream } from 'antlr4ts';
import { DicenicLexer } from '../src/generated/DicenicLexer';
import { DicenicParser } from '../src/generated/DicenicParser';
import { DicenicInterpreter } from '../src/interpreter/DicenicInterpreter';
import { ExecutionContext } from '../src/interpreter/ExecutionContext';
import { VariableType } from '../src/interpreter/types';

describe('While循环语句测试', () => {
  let interpreter: DicenicInterpreter;
  let context: ExecutionContext;

  beforeEach(() => {
    context = new ExecutionContext();
    interpreter = new DicenicInterpreter(context);
  });

  /**
   * 解析并执行Dicenic脚本
   * @param script 脚本内容
   * @returns 执行结果
   */
  function executeScript(script: string): string {
    const inputStream = new ANTLRInputStream(script);
    const lexer = new DicenicLexer(inputStream);
    const tokenStream = new CommonTokenStream(lexer);
    const parser = new DicenicParser(tokenStream);
    
    const parseTree = parser.program();
    return interpreter.interpret(parseTree);
  }

  test('基本while循环 - 计数器递增', () => {
    const script = `
      i = 0
      sum = 0
      while (i < 5) {
        sum = sum + i
        i = i + 1
      }
      sum
    `;
    
    const result = executeScript(script);
    expect(result).toBe('10'); // 0+1+2+3+4 = 10
  });

  test('while循环 - 条件为假时不执行', () => {
    const script = `
      x = 10
      while (x < 5) {
        x = x + 1
      }
      x
    `;
    
    const result = executeScript(script);
    expect(result).toBe('10'); // 条件为假，循环体不执行，x保持原值
  });

  test('while循环 - 复合赋值运算符', () => {
    const script = `
      count = 1
      result = 1
      while (count <= 4) {
        result *= count
        count += 1
      }
      result
    `;
    
    const result = executeScript(script);
    expect(result).toBe('24'); // 1*1*2*3*4 = 24 (阶乘)
  });

  test('while循环 - 字符串条件判断', () => {
    const script = `
      str = "hello"
      count = 0
      while (str) {
        count += 1
        if (count >= 3) {
          str = ""
        }
      }
      count
    `;
    
    const result = executeScript(script);
    expect(result).toBe('3'); // 非空字符串为真，循环3次后设为空字符串
  });

  test('while循环 - 嵌套循环', () => {
    const script = `
      i = 1
      j = 1
      sum = 0
      while (i <= 2) {
        j = 1
        while (j <= 3) {
          sum += i * j
          j += 1
        }
        i += 1
      }
      sum
    `;
    
    const result = executeScript(script);
    expect(result).toBe('18'); // (1*1+1*2+1*3) + (2*1+2*2+2*3) = 6 + 12 = 18
  });

  test('while循环 - 使用特殊变量', () => {
    // 设置初始特殊变量值
    context.setSpecialVariable('a', '生命值', { type: VariableType.NUMBER, value: 100 });
    context.setSpecialVariable('a', '伤害', { type: VariableType.NUMBER, value: 15 });
    
    const script = `
      回合数 = 0
      while ($a生命值 > 0) {
        $a生命值 -= $a伤害
        回合数 += 1
        if (回合数 >= 10) {
          $a生命值 = 0
        }
      }
      回合数
    `;
    
    const result = executeScript(script);
    expect(result).toBe('7'); // 100/15 = 6.67，需要7回合才能将生命值降到0以下
  });

  test('while循环 - 逻辑运算条件', () => {
    const script = `
      a = 1
      b = 10
      count = 0
      while (a < 5 && b > 5) {
        a += 1
        b -= 1
        count += 1
      }
      count
    `;
    
    const result = executeScript(script);
    expect(result).toBe('4'); // 当a=5或b=5时停止，需要4次循环
  });

  test('while循环 - 三元运算符在循环体中', () => {
    const script = `
      n = 10
      result = 0
      while (n > 0) {
        result += n % 2 == 0 ? n : 0
        n -= 1
      }
      result
    `;
    
    const result = executeScript(script);
    expect(result).toBe('30'); // 10+8+6+4+2 = 30 (偶数之和)
  });

  test('while循环 - 单语句循环体', () => {
    const script = `
      x = 5
      while (x > 0) x -= 1
      x
    `;
    
    const result = executeScript(script);
    expect(result).toBe('0'); // x从5递减到0
  });

  test('while循环 - 空循环体', () => {
    const script = `
      counter = 3
      while (counter > 0) {
      }
      counter
    `;
    
    // 这个测试应该会因为无限循环而被循环深度限制终止
    // 由于循环体为空，counter永远不会改变，会触发最大循环次数限制
    const consoleSpy = jest.spyOn(console, 'warn').mockImplementation();
    
    const result = executeScript(script);
    expect(result).toBe('3'); // counter保持不变
    expect(consoleSpy).toHaveBeenCalledWith(
      expect.stringContaining('While loop exceeded maximum iteration count')
    );
    
    consoleSpy.mockRestore();
  });

  test('while循环 - 复杂条件表达式', () => {
    const script = `
      x = 1
      y = 1
      steps = 0
      while (x * y < 50 && steps < 10) {
        if (x < y) {
          x += 1
        } else {
          y += 1
        }
        steps += 1
      }
      steps
    `;
    
    const result = executeScript(script);
    const numResult = parseInt(result);
    expect(numResult).toBeGreaterThanOrEqual(1); // 至少执行一次循环
    expect(numResult).toBeLessThanOrEqual(10); // 不超过最大步数限制
  });

  test('while循环 - 布尔值转换', () => {
    const script = `
      value = 5
      iterations = 0
      while (value) {
        value -= 1
        iterations += 1
        if (iterations > 10) {
          value = 0
        }
      }
      iterations
    `;
    
    const result = executeScript(script);
    expect(result).toBe('5'); // value从5递减到0，共5次迭代
  });

  test('while循环 - 变量更新在循环中', () => {
    const script = `
      count = 0
      result = 0
      while (count < 3) {
        result = count * 10
        count += 1
      }
      result
    `;
    
    const result = executeScript(script);
    expect(result).toBe('20'); // 最后一次循环的结果 (count=2时, result=2*10=20)
  });
});