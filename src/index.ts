/**
 * Dicenic脚本语言解析器主入口文件
 * 
 * 提供简洁的API接口用于解析和执行Dicenic脚本
 * 
 * @copyright 2024 [Your Name]
 * @license CC-BY-4.0
 * 
 * This work is licensed under the Creative Commons Attribution 4.0 International License.
 * To view a copy of this license, visit http://creativecommons.org/licenses/by/4.0/
 */

import { ANTLRInputStream, CommonTokenStream } from 'antlr4ts';
import { DicenicLexer } from './generated/DicenicLexer';
import { DicenicParser } from './generated/DicenicParser';
import { DicenicInterpreter } from './interpreter/DicenicInterpreter';
import { ExecutionContext } from './interpreter/ExecutionContext';
import { ErrorHandler, ErrorHandlerConfig } from './errors';
import { ExecutionContextData, DicenicValue, VariableType } from './interpreter/types';

// 导出核心类型和类
export * from './interpreter/types';
export { DicenicInterpreter } from './interpreter/DicenicInterpreter';
export { ExecutionContext } from './interpreter/ExecutionContext';
export { TypeConverter } from './utils/TypeConverter';
export { DiceCalculator } from './utils/DiceCalculator';
export { StringInterpolator } from './utils/StringInterpolator';
export * from './errors';

/**
 * 脚本执行结果接口
 */
export interface ScriptResult {
  /** 脚本执行的最终结果值 */
  result: string;
  /** 执行过程中产生的错误 */
  errors: string[];
  /** 执行过程中产生的警告 */
  warnings: string[];
  /** 是否执行成功 */
  success: boolean;
}

/**
 * 脚本执行选项接口
 */
export interface ScriptOptions {
  /** 执行上下文数据 */
  context?: Partial<ExecutionContextData>;
  /** 错误处理配置 */
  errorConfig?: Partial<ErrorHandlerConfig>;
  /** 是否启用错误恢复 */
  enableErrorRecovery?: boolean;
}

/**
 * 解析并执行Dicenic脚本
 * @param script 要执行的脚本代码
 * @param options 执行选项
 * @returns 执行结果
 */
export function executeScript(script: string, options: ScriptOptions = {}): ScriptResult {
  try {
    // 创建执行上下文
    const context = createExecutionContext(options.context);
    
    // 创建错误处理器
    const errorHandler = new ErrorHandler(options.errorConfig);
    
    // 解析脚本
    const { parser, tree, hasErrors } = parseScript(script);
    
    // 如果有语法错误，直接返回失败结果
    if (hasErrors) {
      return {
        result: '',
        errors: ['Syntax error in script'],
        warnings: [],
        success: false
      };
    }
    
    // 创建解释器并执行
    const interpreter = new DicenicInterpreter(context, errorHandler);
    const result = interpreter.interpret(tree);
    
    // 获取错误和警告信息
    const errors = errorHandler.getErrors().map(error => error.getFormattedMessage());
    const warnings = errorHandler.getWarnings(); // getWarnings() already returns string[]
    
    return {
      result,
      errors,
      warnings,
      success: errors.length === 0
    };
  } catch (error) {
    return {
      result: '',
      errors: [error instanceof Error ? error.message : String(error)],
      warnings: [],
      success: false
    };
  }
}

/**
 * 仅解析脚本，不执行
 * @param script 要解析的脚本代码
 * @returns 解析结果，包含解析器和语法树
 */
export function parseScript(script: string): { parser: DicenicParser; tree: any; hasErrors: boolean } {
  const inputStream = new ANTLRInputStream(script);
  const lexer = new DicenicLexer(inputStream);
  const tokenStream = new CommonTokenStream(lexer);
  const parser = new DicenicParser(tokenStream);
  
  // 记录解析错误
  let hasErrors = false;
  
  // 添加自定义错误监听器来检测语法错误
  parser.addErrorListener({
    syntaxError: (recognizer, offendingSymbol, line, charPositionInLine, msg, e) => {
      hasErrors = true;
    }
  });
  
  // 解析程序
  const tree = parser.program();
  
  return { parser, tree, hasErrors };
}

/**
 * 创建执行上下文
 * @param data 初始上下文数据
 * @returns 执行上下文实例
 */
export function createExecutionContext(data?: Partial<ExecutionContextData>): ExecutionContext {
  return new ExecutionContext(data);
}

/**
 * 创建错误处理器
 * @param config 错误处理配置
 * @returns 错误处理器实例
 */
export function createErrorHandler(config?: Partial<ErrorHandlerConfig>): ErrorHandler {
  return new ErrorHandler(config);
}

/**
 * 验证脚本语法
 * @param script 要验证的脚本代码
 * @returns 语法验证结果
 */
export function validateScript(script: string): { valid: boolean; errors: string[] } {
  try {
    const { hasErrors } = parseScript(script);
    
    return {
      valid: !hasErrors,
      errors: hasErrors ? ['Syntax error detected'] : []
    };
  } catch (error) {
    return {
      valid: false,
      errors: [error instanceof Error ? error.message : String(error)]
    };
  }
}

/**
 * 创建默认的执行上下文数据
 * @returns 默认的执行上下文数据
 */
export function createDefaultContext(): ExecutionContextData {
  return {
    attributes: new Map<string, DicenicValue>(),
    roleInfo: new Map<string, DicenicValue>(),
    systemInfo: new Map<string, DicenicValue>(),
    diceInfo: new Map<string, DicenicValue>(),
    variables: new Map<string, DicenicValue>()
  };
}

/**
 * 辅助函数：创建数字值
 * @param value 数字值
 * @returns DicenicValue对象
 */
export function createNumberValue(value: number): DicenicValue {
  return {
    type: VariableType.NUMBER,
    value
  };
}

/**
 * 辅助函数：创建字符串值
 * @param value 字符串值
 * @returns DicenicValue对象
 */
export function createStringValue(value: string): DicenicValue {
  return {
    type: VariableType.STRING,
    value
  };
}

/**
 * 辅助函数：创建掷骰表达式值
 * @param expression 掷骰表达式字符串
 * @returns DicenicValue对象
 */
export function createDiceValue(expression: string): DicenicValue {
  return {
    type: VariableType.DICE_EXPRESSION,
    value: expression
  };
}