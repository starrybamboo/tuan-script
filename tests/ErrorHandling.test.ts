/**
 * 错误处理机制测试
 * 测试各种错误类型的处理和恢复机制
 */

import { ANTLRInputStream, CommonTokenStream } from 'antlr4ts';
import { DicenicLexer } from '../src/generated/DicenicLexer';
import { DicenicParser } from '../src/generated/DicenicParser';
import { DicenicInterpreter } from '../src/interpreter/DicenicInterpreter';
import { ExecutionContext } from '../src/interpreter/ExecutionContext';
import { VariableType } from '../src/interpreter/types';
import { 
  ErrorHandler, 
  DicenicError, 
  SyntaxError, 
  RuntimeError, 
  TypeConversionError, 
  VariableAccessError,
  DiceError,
  LoopError,
  DEFAULT_ERROR_CONFIG
} from '../src/errors';

describe('错误处理机制测试', () => {
  let interpreter: DicenicInterpreter;
  let context: ExecutionContext;
  let errorHandler: ErrorHandler;

  beforeEach(() => {
    context = new ExecutionContext();
    errorHandler = new ErrorHandler();
    interpreter = new DicenicInterpreter(context, errorHandler);
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

  describe('错误类测试', () => {
    test('DicenicError基类应该包含位置信息', () => {
      const error = new DicenicError('Test error', 5, 10);
      
      expect(error.message).toBe('Test error');
      expect(error.line).toBe(5);
      expect(error.column).toBe(10);
      expect(error.errorType).toBe('DicenicError');
      expect(error.getFormattedMessage()).toBe('DicenicError at line 5, column 10: Test error');
    });

    test('SyntaxError应该正确继承DicenicError', () => {
      const error = new SyntaxError('Syntax error', 3, 7);
      
      expect(error).toBeInstanceOf(DicenicError);
      expect(error.errorType).toBe('SyntaxError');
      expect(error.getFormattedMessage()).toBe('SyntaxError at line 3, column 7: Syntax error');
    });

    test('RuntimeError应该包含上下文信息', () => {
      const error = new RuntimeError('Runtime error', 2, 5, 'Variable assignment');
      
      expect(error).toBeInstanceOf(DicenicError);
      expect(error.errorType).toBe('RuntimeError');
      expect(error.context).toBe('Variable assignment');
      expect(error.getFormattedMessage()).toContain('Context: Variable assignment');
    });

    test('TypeConversionError应该包含类型信息', () => {
      const error = new TypeConversionError('Conversion failed', 'string', 'number', 'abc', 1, 2);
      
      expect(error).toBeInstanceOf(DicenicError);
      expect(error.errorType).toBe('TypeConversionError');
      expect(error.sourceType).toBe('string');
      expect(error.targetType).toBe('number');
      expect(error.sourceValue).toBe('abc');
      expect(error.getFormattedMessage()).toContain('Failed to convert string(abc) to number');
    });

    test('VariableAccessError应该包含变量信息', () => {
      const error = new VariableAccessError('Access denied', '$rtest', 'write', 4, 8);
      
      expect(error).toBeInstanceOf(DicenicError);
      expect(error.errorType).toBe('VariableAccessError');
      expect(error.variableName).toBe('$rtest');
      expect(error.accessType).toBe('write');
      expect(error.getFormattedMessage()).toContain('Variable: $rtest, Access: write');
    });

    test('DiceError应该包含掷骰表达式信息', () => {
      const error = new DiceError('Invalid dice', '0d6', 1, 1);
      
      expect(error).toBeInstanceOf(DicenicError);
      expect(error.errorType).toBe('DiceError');
      expect(error.diceExpression).toBe('0d6');
      expect(error.getFormattedMessage()).toContain('Dice Expression: 0d6');
    });

    test('LoopError应该包含循环信息', () => {
      const error = new LoopError('Infinite loop', 'while', 10000, 5, 1);
      
      expect(error).toBeInstanceOf(DicenicError);
      expect(error.errorType).toBe('LoopError');
      expect(error.loopType).toBe('while');
      expect(error.maxIterations).toBe(10000);
      expect(error.getFormattedMessage()).toContain('Loop Type: while');
      expect(error.getFormattedMessage()).toContain('Max Iterations: 10000');
    });

    test('错误对象应该能够转换为JSON', () => {
      const error = new RuntimeError('Test error', 1, 2, 'Test context');
      const json = error.toJSON();
      
      expect(json).toEqual({
        type: 'RuntimeError',
        message: 'Test error',
        line: 1,
        column: 2,
        stack: error.stack,
        context: 'Test context'
      });
    });
  });

  describe('ErrorHandler测试', () => {
    test('应该使用默认配置', () => {
      const handler = new ErrorHandler();
      const config = handler.getConfig();
      
      expect(config).toEqual(DEFAULT_ERROR_CONFIG);
    });

    test('应该能够更新配置', () => {
      const handler = new ErrorHandler();
      handler.updateConfig({ enableRecovery: false, maxErrors: 5 });
      
      const config = handler.getConfig();
      expect(config.enableRecovery).toBe(false);
      expect(config.maxErrors).toBe(5);
      expect(config.logWarnings).toBe(DEFAULT_ERROR_CONFIG.logWarnings); // 其他配置保持不变
    });

    test('应该能够处理类型转换错误并返回默认值', () => {
      const handler = new ErrorHandler({ useDefaultOnTypeError: true });
      
      const result = handler.handleTypeConversionError(
        'Cannot convert string to number',
        'string',
        'number',
        'abc'
      );
      
      expect(result).toEqual({ type: VariableType.NUMBER, value: 0 });
      expect(handler.hasWarnings()).toBe(true);
      expect(handler.hasErrors()).toBe(false);
    });

    test('应该能够处理掷骰错误并返回默认值', () => {
      const handler = new ErrorHandler({ enableRecovery: true });
      
      const result = handler.handleDiceError('Invalid dice expression', '0d6');
      
      expect(result).toEqual({ type: VariableType.NUMBER, value: 0 });
      expect(handler.hasWarnings()).toBe(true);
    });

    test('应该能够记录和获取错误摘要', () => {
      const handler = new ErrorHandler({ enableRecovery: true });
      
      handler.handleRuntimeError('Runtime error 1');
      handler.handleDiceError('Dice error', '0d6');
      handler.handleLoopError('Loop error', 'while', 1000);
      
      const summary = handler.getSummary();
      expect(summary.errorCount).toBe(1); // RuntimeError
      expect(summary.warningCount).toBe(2); // DiceError + LoopError
      expect(summary.errors).toHaveLength(1);
      expect(summary.warnings).toHaveLength(2);
    });

    test('应该能够清空错误和警告', () => {
      const handler = new ErrorHandler({ enableRecovery: true });
      
      handler.handleRuntimeError('Test error');
      handler.handleDiceError('Test dice error', '0d6');
      
      expect(handler.hasErrors()).toBe(true);
      expect(handler.hasWarnings()).toBe(true);
      
      handler.clear();
      
      expect(handler.hasErrors()).toBe(false);
      expect(handler.hasWarnings()).toBe(false);
    });

    test('应该在错误数量超过限制时抛出错误', () => {
      const handler = new ErrorHandler({ maxErrors: 2, enableRecovery: true });
      
      handler.handleRuntimeError('Error 1');
      handler.handleRuntimeError('Error 2');
      
      // 第三个错误应该触发限制
      expect(() => {
        handler.handleRuntimeError('Error 3');
      }).toThrow('Too many errors');
    });
  });

  describe('解释器错误处理集成测试', () => {
    test('应该处理无效的掷骰表达式', () => {
      const script = '0d6'; // 无效的掷骰表达式
      
      const result = executeScript(script);
      expect(result).toBe('0'); // 应该返回默认值
      
      expect(interpreter.hasWarnings()).toBe(true);
      expect(interpreter.hasErrors()).toBe(false);
      
      const summary = interpreter.getErrorSummary();
      expect(summary.warningCount).toBeGreaterThan(0);
    });

    test('应该处理只读变量的写入尝试', () => {
      const script = '$r测试 = "值"';
      
      const result = executeScript(script);
      expect(result).toBe('值'); // 返回赋值但不实际执行
      
      expect(interpreter.hasErrors()).toBe(true);
      
      const summary = interpreter.getErrorSummary();
      expect(summary.errorCount).toBeGreaterThan(0);
      expect(summary.errors[0]).toBeInstanceOf(VariableAccessError);
    });

    test('应该处理while循环的无限循环保护', () => {
      const script = `
        x = 1
        while (x > 0) {
          // 空循环体，会触发无限循环保护
        }
        x
      `;
      
      const result = executeScript(script);
      expect(result).toBe('1'); // x保持不变
      
      expect(interpreter.hasWarnings()).toBe(true);
      
      const summary = interpreter.getErrorSummary();
      expect(summary.warningCount).toBeGreaterThan(0);
    });

    test('应该能够获取错误处理器', () => {
      const handler = interpreter.getErrorHandler();
      expect(handler).toBeInstanceOf(ErrorHandler);
    });

    test('应该能够设置新的错误处理器', () => {
      const newHandler = new ErrorHandler({ enableRecovery: false });
      interpreter.setErrorHandler(newHandler);
      
      expect(interpreter.getErrorHandler()).toBe(newHandler);
    });

    test('应该能够检查错误和警告状态', () => {
      expect(interpreter.hasErrors()).toBe(false);
      expect(interpreter.hasWarnings()).toBe(false);
      
      // 触发一个警告
      executeScript('0d6');
      
      expect(interpreter.hasWarnings()).toBe(true);
      expect(interpreter.hasErrors()).toBe(false);
    });
  });

  describe('错误恢复机制测试', () => {
    test('启用错误恢复时应该继续执行', () => {
      const handler = new ErrorHandler({ enableRecovery: true });
      const interpreterWithRecovery = new DicenicInterpreter(context, handler);
      
      const script = `
        a = 5
        0d6  // 这会产生警告但不会停止执行
        b = 10
        a + b
      `;
      
      const inputStream = new ANTLRInputStream(script);
      const lexer = new DicenicLexer(inputStream);
      const tokenStream = new CommonTokenStream(lexer);
      const parser = new DicenicParser(tokenStream);
      const parseTree = parser.program();
      
      const result = interpreterWithRecovery.interpret(parseTree);
      expect(result).toBe('15'); // 应该能够继续执行并返回正确结果
      
      expect(interpreterWithRecovery.hasWarnings()).toBe(true);
    });

    test('禁用错误恢复时应该抛出错误', () => {
      const handler = new ErrorHandler({ enableRecovery: false });
      
      expect(() => {
        handler.handleRuntimeError('Test error');
      }).toThrow(RuntimeError);
    });
  });

  describe('需求验证', () => {
    test('需求6.1: 应该抛出包含位置信息的语法错误', () => {
      const error = new SyntaxError('Unexpected token', 5, 10);
      
      expect(error.line).toBe(5);
      expect(error.column).toBe(10);
      expect(error.getFormattedMessage()).toContain('line 5, column 10');
    });

    test('需求6.2: 应该根据变量类型提供默认值', () => {
      // 这个在现有的变量访问逻辑中已经实现
      const script = '未定义变量';
      const result = executeScript(script);
      expect(result).toBe('0'); // 默认返回数字0
    });

    test('需求6.3: 应该在类型转换失败时使用默认值并记录警告', () => {
      const handler = new ErrorHandler({ useDefaultOnTypeError: true });
      
      const result = handler.handleTypeConversionError(
        'Cannot convert',
        'string',
        'number',
        'invalid'
      );
      
      expect(result).toEqual({ type: VariableType.NUMBER, value: 0 });
      expect(handler.hasWarnings()).toBe(true);
    });

    test('需求6.4: 应该提供清晰的错误信息和上下文', () => {
      const error = new RuntimeError(
        'Division by zero',
        10,
        5,
        'Arithmetic operation: 5 / 0'
      );
      
      const message = error.getFormattedMessage();
      expect(message).toContain('RuntimeError at line 10, column 5');
      expect(message).toContain('Division by zero');
      expect(message).toContain('Context: Arithmetic operation: 5 / 0');
    });
  });
});