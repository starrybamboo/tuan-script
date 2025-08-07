/**
 * 错误处理器
 * 提供统一的错误处理和恢复机制
 */

import { 
  DicenicError, 
  SyntaxError, 
  RuntimeError, 
  TypeConversionError, 
  VariableAccessError,
  DiceError,
  LoopError
} from './DicenicError';
import { DicenicValue, VariableType } from '../interpreter/types';

/**
 * 错误处理配置接口
 */
export interface ErrorHandlerConfig {
  /** 是否启用错误恢复 */
  enableRecovery: boolean;
  /** 是否记录警告 */
  logWarnings: boolean;
  /** 最大错误数量，超过后停止执行 */
  maxErrors: number;
  /** 是否在类型转换失败时使用默认值 */
  useDefaultOnTypeError: boolean;
}

/**
 * 默认错误处理配置
 */
export const DEFAULT_ERROR_CONFIG: ErrorHandlerConfig = {
  enableRecovery: true,
  logWarnings: true,
  maxErrors: 10,
  useDefaultOnTypeError: true
};

/**
 * 错误处理器类
 * 负责统一处理各种类型的错误
 */
export class ErrorHandler {
  private config: ErrorHandlerConfig;
  private errors: DicenicError[] = [];
  private warnings: string[] = [];

  constructor(config: Partial<ErrorHandlerConfig> = {}) {
    this.config = { ...DEFAULT_ERROR_CONFIG, ...config };
  }

  /**
   * 处理语法错误
   * @param message 错误信息
   * @param line 行号
   * @param column 列号
   * @throws SyntaxError 如果不启用错误恢复
   */
  handleSyntaxError(message: string, line: number = -1, column: number = -1): void {
    const error = new SyntaxError(message, line, column);
    this.addError(error);

    if (!this.config.enableRecovery) {
      throw error;
    }

    if (this.config.logWarnings) {
      console.error(error.getFormattedMessage());
    }
  }

  /**
   * 处理运行时错误
   * @param message 错误信息
   * @param line 行号
   * @param column 列号
   * @param context 上下文信息
   * @throws RuntimeError 如果不启用错误恢复
   */
  handleRuntimeError(
    message: string, 
    line: number = -1, 
    column: number = -1, 
    context?: string
  ): void {
    const error = new RuntimeError(message, line, column, context);
    this.addError(error);

    if (!this.config.enableRecovery) {
      throw error;
    }

    if (this.config.logWarnings) {
      console.error(error.getFormattedMessage());
    }
  }

  /**
   * 处理类型转换错误
   * @param message 错误信息
   * @param sourceType 源类型
   * @param targetType 目标类型
   * @param sourceValue 源值
   * @param line 行号
   * @param column 列号
   * @returns 默认值（如果启用了默认值恢复）
   */
  handleTypeConversionError(
    message: string,
    sourceType: string,
    targetType: string,
    sourceValue: any,
    line: number = -1,
    column: number = -1
  ): DicenicValue | null {
    const error = new TypeConversionError(message, sourceType, targetType, sourceValue, line, column);
    
    if (this.config.useDefaultOnTypeError) {
      this.addWarning(error.getFormattedMessage());
      
      if (this.config.logWarnings) {
        console.warn(error.getFormattedMessage());
      }

      // 返回目标类型的默认值
      return this.getDefaultValueForType(targetType);
    } else {
      this.addError(error);
      
      if (!this.config.enableRecovery) {
        throw error;
      }

      if (this.config.logWarnings) {
        console.error(error.getFormattedMessage());
      }
    }

    return null;
  }

  /**
   * 处理变量访问错误
   * @param message 错误信息
   * @param variableName 变量名
   * @param accessType 访问类型
   * @param line 行号
   * @param column 列号
   * @throws VariableAccessError 如果不启用错误恢复
   */
  handleVariableAccessError(
    message: string,
    variableName: string,
    accessType: 'read' | 'write',
    line: number = -1,
    column: number = -1
  ): void {
    const error = new VariableAccessError(message, variableName, accessType, line, column);
    this.addError(error);

    if (!this.config.enableRecovery) {
      throw error;
    }

    if (this.config.logWarnings) {
      console.error(error.getFormattedMessage());
    }
  }

  /**
   * 处理掷骰错误
   * @param message 错误信息
   * @param diceExpression 掷骰表达式
   * @param line 行号
   * @param column 列号
   * @returns 默认值（如果启用了错误恢复）
   */
  handleDiceError(
    message: string,
    diceExpression: string,
    line: number = -1,
    column: number = -1
  ): DicenicValue | null {
    const error = new DiceError(message, diceExpression, line, column);
    
    if (this.config.enableRecovery) {
      this.addWarning(error.getFormattedMessage());
      
      if (this.config.logWarnings) {
        console.warn(error.getFormattedMessage());
      }

      // 返回默认的数字值
      return { type: VariableType.NUMBER, value: 0 };
    } else {
      this.addError(error);
      throw error;
    }
  }

  /**
   * 处理循环错误
   * @param message 错误信息
   * @param loopType 循环类型
   * @param maxIterations 最大迭代次数
   * @param line 行号
   * @param column 列号
   */
  handleLoopError(
    message: string,
    loopType: string,
    maxIterations?: number,
    line: number = -1,
    column: number = -1
  ): void {
    const error = new LoopError(message, loopType, maxIterations, line, column);
    this.addWarning(error.getFormattedMessage());

    if (this.config.logWarnings) {
      console.warn(error.getFormattedMessage());
    }
  }

  /**
   * 添加错误到错误列表
   * @param error 错误对象
   */
  private addError(error: DicenicError): void {
    this.errors.push(error);
    
    // 检查是否超过最大错误数量
    if (this.errors.length > this.config.maxErrors) {
      throw new RuntimeError(
        `Too many errors (${this.errors.length}), stopping execution`,
        -1,
        -1,
        'Error limit exceeded'
      );
    }
  }

  /**
   * 添加警告到警告列表
   * @param warning 警告信息
   */
  private addWarning(warning: string): void {
    this.warnings.push(warning);
  }

  /**
   * 获取指定类型的默认值
   * @param targetType 目标类型
   * @returns 默认值
   */
  private getDefaultValueForType(targetType: string): DicenicValue {
    switch (targetType.toLowerCase()) {
      case 'number':
        return { type: VariableType.NUMBER, value: 0 };
      case 'string':
        return { type: VariableType.STRING, value: '' };
      case 'dice_expression':
        return { type: VariableType.DICE_EXPRESSION, value: 0 };
      default:
        return { type: VariableType.NUMBER, value: 0 };
    }
  }

  /**
   * 获取所有错误
   * @returns 错误列表
   */
  getErrors(): DicenicError[] {
    return [...this.errors];
  }

  /**
   * 获取所有警告
   * @returns 警告列表
   */
  getWarnings(): string[] {
    return [...this.warnings];
  }

  /**
   * 检查是否有错误
   * @returns 是否有错误
   */
  hasErrors(): boolean {
    return this.errors.length > 0;
  }

  /**
   * 检查是否有警告
   * @returns 是否有警告
   */
  hasWarnings(): boolean {
    return this.warnings.length > 0;
  }

  /**
   * 清空所有错误和警告
   */
  clear(): void {
    this.errors = [];
    this.warnings = [];
  }

  /**
   * 获取错误摘要
   * @returns 错误摘要信息
   */
  getSummary(): {
    errorCount: number;
    warningCount: number;
    errors: DicenicError[];
    warnings: string[];
  } {
    return {
      errorCount: this.errors.length,
      warningCount: this.warnings.length,
      errors: this.getErrors(),
      warnings: this.getWarnings()
    };
  }

  /**
   * 更新配置
   * @param newConfig 新的配置
   */
  updateConfig(newConfig: Partial<ErrorHandlerConfig>): void {
    this.config = { ...this.config, ...newConfig };
  }

  /**
   * 获取当前配置
   * @returns 当前配置
   */
  getConfig(): ErrorHandlerConfig {
    return { ...this.config };
  }
}