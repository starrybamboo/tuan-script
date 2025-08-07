/**
 * Dicenic脚本语言错误类体系
 * 提供详细的错误信息和位置信息
 */

/**
 * Dicenic错误基类
 * 包含错误信息和位置信息
 */
export class DicenicError extends Error {
  public readonly line: number;
  public readonly column: number;
  public readonly errorType: string;

  constructor(message: string, line: number = -1, column: number = -1, errorType: string = 'DicenicError') {
    super(message);
    this.name = errorType;
    this.line = line;
    this.column = column;
    this.errorType = errorType;
    
    // 确保错误堆栈正确显示
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, this.constructor);
    }
  }

  /**
   * 获取格式化的错误信息
   * @returns 包含位置信息的错误信息
   */
  getFormattedMessage(): string {
    if (this.line >= 0 && this.column >= 0) {
      return `${this.errorType} at line ${this.line}, column ${this.column}: ${this.message}`;
    } else if (this.line >= 0) {
      return `${this.errorType} at line ${this.line}: ${this.message}`;
    } else {
      return `${this.errorType}: ${this.message}`;
    }
  }

  /**
   * 转换为JSON格式
   * @returns 错误信息的JSON表示
   */
  toJSON(): object {
    return {
      type: this.errorType,
      message: this.message,
      line: this.line,
      column: this.column,
      stack: this.stack
    };
  }
}

/**
 * 语法错误类
 * 用于词法分析和语法分析阶段的错误
 */
export class SyntaxError extends DicenicError {
  constructor(message: string, line: number = -1, column: number = -1) {
    super(message, line, column, 'SyntaxError');
  }
}

/**
 * 运行时错误类
 * 用于脚本执行阶段的错误
 */
export class RuntimeError extends DicenicError {
  public readonly context?: string;

  constructor(message: string, line: number = -1, column: number = -1, context?: string) {
    super(message, line, column, 'RuntimeError');
    this.context = context;
  }

  /**
   * 获取包含上下文的格式化错误信息
   * @returns 包含上下文信息的错误信息
   */
  getFormattedMessage(): string {
    const baseMessage = super.getFormattedMessage();
    if (this.context) {
      return `${baseMessage}\nContext: ${this.context}`;
    }
    return baseMessage;
  }

  /**
   * 转换为JSON格式
   * @returns 错误信息的JSON表示
   */
  toJSON(): object {
    return {
      ...super.toJSON(),
      context: this.context
    };
  }
}

/**
 * 类型转换错误类
 * 用于类型转换失败的情况
 */
export class TypeConversionError extends DicenicError {
  public readonly sourceType: string;
  public readonly targetType: string;
  public readonly sourceValue: any;

  constructor(
    message: string, 
    sourceType: string, 
    targetType: string, 
    sourceValue: any,
    line: number = -1, 
    column: number = -1
  ) {
    super(message, line, column, 'TypeConversionError');
    this.sourceType = sourceType;
    this.targetType = targetType;
    this.sourceValue = sourceValue;
  }

  /**
   * 获取包含类型信息的格式化错误信息
   * @returns 包含类型转换信息的错误信息
   */
  getFormattedMessage(): string {
    const baseMessage = super.getFormattedMessage();
    return `${baseMessage}\nFailed to convert ${this.sourceType}(${this.sourceValue}) to ${this.targetType}`;
  }

  /**
   * 转换为JSON格式
   * @returns 错误信息的JSON表示
   */
  toJSON(): object {
    return {
      ...super.toJSON(),
      sourceType: this.sourceType,
      targetType: this.targetType,
      sourceValue: this.sourceValue
    };
  }
}

/**
 * 变量访问错误类
 * 用于变量访问权限或变量不存在的错误
 */
export class VariableAccessError extends DicenicError {
  public readonly variableName: string;
  public readonly accessType: 'read' | 'write';

  constructor(
    message: string, 
    variableName: string, 
    accessType: 'read' | 'write',
    line: number = -1, 
    column: number = -1
  ) {
    super(message, line, column, 'VariableAccessError');
    this.variableName = variableName;
    this.accessType = accessType;
  }

  /**
   * 获取包含变量信息的格式化错误信息
   * @returns 包含变量访问信息的错误信息
   */
  getFormattedMessage(): string {
    const baseMessage = super.getFormattedMessage();
    return `${baseMessage}\nVariable: ${this.variableName}, Access: ${this.accessType}`;
  }

  /**
   * 转换为JSON格式
   * @returns 错误信息的JSON表示
   */
  toJSON(): object {
    return {
      ...super.toJSON(),
      variableName: this.variableName,
      accessType: this.accessType
    };
  }
}

/**
 * 掷骰错误类
 * 用于掷骰表达式相关的错误
 */
export class DiceError extends DicenicError {
  public readonly diceExpression: string;

  constructor(message: string, diceExpression: string, line: number = -1, column: number = -1) {
    super(message, line, column, 'DiceError');
    this.diceExpression = diceExpression;
  }

  /**
   * 获取包含掷骰表达式的格式化错误信息
   * @returns 包含掷骰表达式信息的错误信息
   */
  getFormattedMessage(): string {
    const baseMessage = super.getFormattedMessage();
    return `${baseMessage}\nDice Expression: ${this.diceExpression}`;
  }

  /**
   * 转换为JSON格式
   * @returns 错误信息的JSON表示
   */
  toJSON(): object {
    return {
      ...super.toJSON(),
      diceExpression: this.diceExpression
    };
  }
}

/**
 * 循环错误类
 * 用于循环相关的错误（如无限循环）
 */
export class LoopError extends DicenicError {
  public readonly loopType: string;
  public readonly maxIterations?: number;

  constructor(
    message: string, 
    loopType: string, 
    maxIterations?: number,
    line: number = -1, 
    column: number = -1
  ) {
    super(message, line, column, 'LoopError');
    this.loopType = loopType;
    this.maxIterations = maxIterations;
  }

  /**
   * 获取包含循环信息的格式化错误信息
   * @returns 包含循环信息的错误信息
   */
  getFormattedMessage(): string {
    const baseMessage = super.getFormattedMessage();
    let details = `\nLoop Type: ${this.loopType}`;
    if (this.maxIterations !== undefined) {
      details += `\nMax Iterations: ${this.maxIterations}`;
    }
    return baseMessage + details;
  }

  /**
   * 转换为JSON格式
   * @returns 错误信息的JSON表示
   */
  toJSON(): object {
    return {
      ...super.toJSON(),
      loopType: this.loopType,
      maxIterations: this.maxIterations
    };
  }
}