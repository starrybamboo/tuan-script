/**
 * Dicenic脚本语言主解释器
 * 继承ANTLR4生成的Visitor，实现具体的执行逻辑
 */

import { DicenicVisitor } from '../generated/DicenicVisitor';
import { 
  ProgramContext, 
  StatementContext,
  ExpressionStatementContext,
  NumberLiteralContext,
  StringLiteralContext,
  IdentifierContext,
  SpecialVariableContext,
  DiceExpressionContext,
  ExpressionContext,
  PrimaryExpressionContext,
  AdditiveExpressionContext,
  MultiplicativeExpressionContext,
  RelationalExpressionContext,
  EqualityExpressionContext,
  LogicalOrExpressionContext,
  LogicalAndExpressionContext,
  UnaryExpressionContext,
  AssignmentExpressionContext,
  PostfixExpressionContext,
  TernaryExpressionContext,
  IfStatementContext,
  BlockContext,
  WhileStatementContext
} from '../generated/DicenicParser';
import { ExecutionContext } from './ExecutionContext';
import { DicenicValue, VariableType } from './types';
import { TypeConverter } from '../utils/TypeConverter';
import { DiceCalculator } from '../utils/DiceCalculator';
import { StringInterpolator } from '../utils/StringInterpolator';
import { ParseTree } from 'antlr4ts/tree/ParseTree';
import { TerminalNode } from 'antlr4ts/tree/TerminalNode';
import { ErrorHandler, RuntimeError, VariableAccessError, DiceError, LoopError } from '../errors';

export class DicenicInterpreter implements DicenicVisitor<DicenicValue> {
  private context: ExecutionContext;
  private lastValue: DicenicValue;
  private errorHandler: ErrorHandler;
  
  // 性能优化：缓存常用的默认值对象，避免重复创建
  private static readonly DEFAULT_NUMBER_VALUE: DicenicValue = { type: VariableType.NUMBER, value: 0 };
  private static readonly DEFAULT_STRING_VALUE: DicenicValue = { type: VariableType.STRING, value: '' };

  constructor(context?: ExecutionContext, errorHandler?: ErrorHandler) {
    this.context = context || new ExecutionContext();
    this.lastValue = DicenicInterpreter.DEFAULT_NUMBER_VALUE;
    this.errorHandler = errorHandler || new ErrorHandler();
  }

  /**
   * 解释执行Dicenic脚本
   * @param parseTree 解析树
   * @returns 最后表达式的字符串结果
   */
  interpret(parseTree: ParseTree): string {
    // 重置最后值
    this.lastValue = { type: VariableType.NUMBER, value: 0 };
    
    // 访问解析树
    this.visit(parseTree);
    
    // 返回最后值的字符串表示
    return TypeConverter.toString(this.lastValue);
  }

  /**
   * 通用访问方法
   * @param tree 解析树节点
   * @returns 访问结果
   */
  visit(tree: ParseTree): DicenicValue {
    if (!tree) {
      return { type: VariableType.NUMBER, value: 0 };
    }

    // 如果是终端节点，直接返回默认值
    if (tree instanceof TerminalNode) {
      return { type: VariableType.NUMBER, value: 0 };
    }

    // 根据节点类型调用相应的访问方法
    const result = tree.accept(this);
    return result || { type: VariableType.NUMBER, value: 0 };
  }

  /**
   * 访问程序节点
   * @param ctx 程序上下文
   * @returns 程序执行结果
   */
  visitProgram(ctx: ProgramContext): DicenicValue {
    let result: DicenicValue = { type: VariableType.NUMBER, value: 0 };
    
    // 执行所有语句
    for (let i = 0; i < ctx.childCount; i++) {
      const child = ctx.getChild(i);
      if (child && !(child instanceof TerminalNode)) {
        result = this.visit(child);
        // 更新最后值
        this.lastValue = result;
      }
    }
    
    return result;
  }

  /**
   * 访问语句节点
   * @param ctx 语句上下文
   * @returns 语句执行结果
   */
  visitStatement(ctx: StatementContext): DicenicValue {
    // 语句节点通常只有一个子节点
    if (ctx.childCount > 0) {
      const child = ctx.getChild(0);
      return this.visit(child);
    }
    
    return { type: VariableType.NUMBER, value: 0 };
  }

  /**
   * 访问if语句节点
   * 实现条件判断和分支执行，支持else分支
   * @param ctx if语句上下文
   * @returns if语句执行结果
   */
  visitIfStatement(ctx: IfStatementContext): DicenicValue {
    // 获取条件表达式
    const conditionExpression = ctx.expression();
    const conditionValue = this.visit(conditionExpression);
    
    // 将条件值转换为布尔值
    const condition = TypeConverter.toBoolean(conditionValue);
    
    // 获取语句列表
    const statements = ctx.statement();
    
    if (condition) {
      // 条件为真，执行第一个语句（if分支）
      if (statements.length > 0) {
        return this.visit(statements[0]);
      }
    } else {
      // 条件为假，检查是否有else分支
      const elseToken = ctx.ELSE();
      if (elseToken && statements.length > 1) {
        // 执行第二个语句（else分支）
        return this.visit(statements[1]);
      }
    }
    
    // 如果没有执行任何分支，返回默认值
    return { type: VariableType.NUMBER, value: 0 };
  }

  /**
   * 访问while循环语句节点
   * 实现循环条件判断和循环体执行，包含循环深度限制防止无限循环
   * @param ctx while语句上下文
   * @returns while循环执行结果
   */
  visitWhileStatement(ctx: WhileStatementContext): DicenicValue {
    let result: DicenicValue = { type: VariableType.NUMBER, value: 0 };
    let loopCount = 0;
    const maxLoopCount = 10000; // 防止无限循环的最大迭代次数
    
    // 获取条件表达式和循环体语句
    const conditionExpression = ctx.expression();
    const bodyStatement = ctx.statement();
    
    // 循环执行
    while (loopCount < maxLoopCount) {
      // 计算条件表达式
      const conditionValue = this.visit(conditionExpression);
      const condition = TypeConverter.toBoolean(conditionValue);
      
      // 如果条件为假，退出循环
      if (!condition) {
        break;
      }
      
      // 执行循环体
      result = this.visit(bodyStatement);
      // 更新最后值
      this.lastValue = result;
      
      loopCount++;
    }
    
    // 如果达到最大循环次数，处理循环错误
    if (loopCount >= maxLoopCount) {
      this.errorHandler.handleLoopError(
        'While loop exceeded maximum iteration count, terminating to prevent infinite loop',
        'while',
        maxLoopCount,
        ctx.start.line,
        ctx.start.charPositionInLine
      );
    }
    
    return result;
  }

  /**
   * 访问代码块节点
   * 执行代码块中的所有语句，返回最后一个语句的结果
   * @param ctx 代码块上下文
   * @returns 代码块执行结果
   */
  visitBlock(ctx: BlockContext): DicenicValue {
    let result: DicenicValue = { type: VariableType.NUMBER, value: 0 };
    
    // 获取代码块中的所有语句
    const statements = ctx.statement();
    
    // 依次执行所有语句
    for (const statement of statements) {
      result = this.visit(statement);
      // 更新最后值
      this.lastValue = result;
    }
    
    return result;
  }

  /**
   * 访问表达式语句节点
   * @param ctx 表达式语句上下文
   * @returns 表达式执行结果
   */
  visitExpressionStatement(ctx: ExpressionStatementContext): DicenicValue {
    // 表达式语句包含一个表达式
    const expression = ctx.expression();
    if (expression) {
      return this.visit(expression);
    }
    
    return { type: VariableType.NUMBER, value: 0 };
  }

  /**
   * 访问表达式节点
   * @param ctx 表达式上下文
   * @returns 表达式执行结果
   */
  visitExpression(ctx: ExpressionContext): DicenicValue {
    // 表达式节点通常只有一个子节点
    if (ctx.childCount > 0) {
      const child = ctx.getChild(0);
      return this.visit(child);
    }
    
    return { type: VariableType.NUMBER, value: 0 };
  }

  /**
   * 访问主表达式节点
   * @param ctx 主表达式上下文
   * @returns 主表达式执行结果
   */
  visitPrimaryExpression(ctx: PrimaryExpressionContext): DicenicValue {
    // 检查各种可能的子节点类型
    const numberLiteral = ctx.numberLiteral();
    if (numberLiteral) {
      return this.visit(numberLiteral);
    }
    
    const stringLiteral = ctx.stringLiteral();
    if (stringLiteral) {
      return this.visit(stringLiteral);
    }
    
    const diceExpression = ctx.diceExpression();
    if (diceExpression) {
      return this.visit(diceExpression);
    }
    
    const specialVariable = ctx.specialVariable();
    if (specialVariable) {
      return this.visit(specialVariable);
    }
    
    const identifier = ctx.identifier();
    if (identifier) {
      return this.visit(identifier);
    }
    
    // 如果是括号表达式 '(' expression ')'
    const expression = ctx.expression();
    if (expression) {
      return this.visit(expression);
    }
    
    return { type: VariableType.NUMBER, value: 0 };
  }

  /**
   * 访问数字字面量节点
   * @param ctx 数字字面量上下文
   * @returns 数字值
   */
  visitNumberLiteral(ctx: NumberLiteralContext): DicenicValue {
    const text = ctx.text;
    const value = parseFloat(text);
    
    return {
      type: VariableType.NUMBER,
      value: isNaN(value) ? 0 : value
    };
  }

  /**
   * 访问字符串字面量节点
   * @param ctx 字符串字面量上下文
   * @returns 字符串值
   */
  visitStringLiteral(ctx: StringLiteralContext): DicenicValue {
    let text = ctx.text;
    
    // 移除引号
    if ((text.startsWith('"') && text.endsWith('"')) || 
        (text.startsWith("'") && text.endsWith("'"))) {
      text = text.slice(1, -1);
    }
    
    // 处理转义字符
    text = text.replace(/\\"/g, '"')
               .replace(/\\'/g, "'")
               .replace(/\\\\/g, '\\')
               .replace(/\\n/g, '\n')
               .replace(/\\t/g, '\t')
               .replace(/\\r/g, '\r');
    
    // 处理字符串插值
    if (StringInterpolator.hasInterpolation(text)) {
      text = StringInterpolator.interpolate(text, this.context);
    }
    
    return {
      type: VariableType.STRING,
      value: text
    };
  }

  /**
   * 访问标识符节点
   * @param ctx 标识符上下文
   * @returns 变量值
   */
  visitIdentifier(ctx: IdentifierContext): DicenicValue {
    const name = ctx.text;
    return this.context.getVariable(name);
  }

  /**
   * 访问特殊变量节点
   * @param ctx 特殊变量上下文
   * @returns 特殊变量值
   */
  visitSpecialVariable(ctx: SpecialVariableContext): DicenicValue {
    const text = ctx.text;
    
    // 解析特殊变量格式：$prefix+name
    if (text.startsWith('$') && text.length > 2) {
      const prefix = text.charAt(1);
      const name = text.substring(2);
      
      return this.context.getSpecialVariable(prefix, name);
    }
    
    // 如果格式不正确，返回默认值
    return { type: VariableType.NUMBER, value: 0 };
  }

  /**
   * 访问掷骰表达式节点
   * @param ctx 掷骰表达式上下文
   * @returns 掷骰结果
   */
  visitDiceExpression(ctx: DiceExpressionContext): DicenicValue {
    const text = ctx.text;
    
    try {
      return DiceCalculator.evaluateDiceExpression(text);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      const result = this.errorHandler.handleDiceError(
        `Failed to evaluate dice expression: ${errorMessage}`,
        text,
        ctx.start.line,
        ctx.start.charPositionInLine
      );
      
      return result || { type: VariableType.NUMBER, value: 0 };
    }
  }

  /**
   * 获取执行上下文
   * @returns 当前执行上下文
   */
  getContext(): ExecutionContext {
    return this.context;
  }

  /**
   * 设置执行上下文
   * @param context 新的执行上下文
   */
  setContext(context: ExecutionContext): void {
    this.context = context;
  }

  /**
   * 获取最后执行的值
   * @returns 最后执行的值
   */
  getLastValue(): DicenicValue {
    return this.lastValue;
  }

  /**
   * 获取错误处理器
   * @returns 错误处理器实例
   */
  getErrorHandler(): ErrorHandler {
    return this.errorHandler;
  }

  /**
   * 设置错误处理器
   * @param errorHandler 新的错误处理器
   */
  setErrorHandler(errorHandler: ErrorHandler): void {
    this.errorHandler = errorHandler;
  }

  /**
   * 检查是否有错误
   * @returns 是否有错误
   */
  hasErrors(): boolean {
    return this.errorHandler.hasErrors();
  }

  /**
   * 检查是否有警告
   * @returns 是否有警告
   */
  hasWarnings(): boolean {
    return this.errorHandler.hasWarnings();
  }

  /**
   * 获取错误摘要
   * @returns 错误摘要信息
   */
  getErrorSummary() {
    return this.errorHandler.getSummary();
  }

  /**
   * 访问加法表达式节点
   * @param ctx 加法表达式上下文
   * @returns 计算结果
   */
  visitAdditiveExpression(ctx: AdditiveExpressionContext): DicenicValue {
    // 获取第一个操作数
    let result = this.visit(ctx.multiplicativeExpression(0));
    
    // 处理后续的加法和减法运算
    const expressions = ctx.multiplicativeExpression();
    for (let i = 1; i < expressions.length; i++) {
      const operator = ctx.getChild(2 * i - 1)?.text; // 获取运算符
      const rightOperand = this.visit(ctx.multiplicativeExpression(i));
      
      // 根据运算符执行相应的运算
      if (operator === '+') {
        result = this.performArithmeticOperation(result, rightOperand, '+');
      } else if (operator === '-') {
        result = this.performArithmeticOperation(result, rightOperand, '-');
      }
    }
    
    return result;
  }

  /**
   * 访问乘法表达式节点
   * @param ctx 乘法表达式上下文
   * @returns 计算结果
   */
  visitMultiplicativeExpression(ctx: MultiplicativeExpressionContext): DicenicValue {
    // 获取第一个操作数
    let result = this.visit(ctx.unaryExpression(0));
    
    // 处理后续的乘法、除法和取模运算
    const expressions = ctx.unaryExpression();
    for (let i = 1; i < expressions.length; i++) {
      const operator = ctx.getChild(2 * i - 1)?.text; // 获取运算符
      const rightOperand = this.visit(ctx.unaryExpression(i));
      
      // 根据运算符执行相应的运算
      if (operator === '*') {
        result = this.performArithmeticOperation(result, rightOperand, '*');
      } else if (operator === '/') {
        result = this.performArithmeticOperation(result, rightOperand, '/');
      } else if (operator === '%') {
        result = this.performArithmeticOperation(result, rightOperand, '%');
      }
    }
    
    return result;
  }

  /**
   * 访问关系表达式节点
   * @param ctx 关系表达式上下文
   * @returns 比较结果
   */
  visitRelationalExpression(ctx: RelationalExpressionContext): DicenicValue {
    // 获取第一个操作数
    let result = this.visit(ctx.additiveExpression(0));
    
    // 处理后续的关系运算
    const expressions = ctx.additiveExpression();
    for (let i = 1; i < expressions.length; i++) {
      const operator = ctx.getChild(2 * i - 1)?.text; // 获取运算符
      const rightOperand = this.visit(ctx.additiveExpression(i));
      
      // 根据运算符执行相应的比较运算
      if (operator === '>') {
        result = this.performComparisonOperation(result, rightOperand, '>');
      } else if (operator === '<') {
        result = this.performComparisonOperation(result, rightOperand, '<');
      } else if (operator === '>=') {
        result = this.performComparisonOperation(result, rightOperand, '>=');
      } else if (operator === '<=') {
        result = this.performComparisonOperation(result, rightOperand, '<=');
      }
    }
    
    return result;
  }

  /**
   * 访问相等表达式节点
   * @param ctx 相等表达式上下文
   * @returns 比较结果
   */
  visitEqualityExpression(ctx: EqualityExpressionContext): DicenicValue {
    // 获取第一个操作数
    let result = this.visit(ctx.relationalExpression(0));
    
    // 处理后续的相等性运算
    const expressions = ctx.relationalExpression();
    for (let i = 1; i < expressions.length; i++) {
      const operator = ctx.getChild(2 * i - 1)?.text; // 获取运算符
      const rightOperand = this.visit(ctx.relationalExpression(i));
      
      // 根据运算符执行相应的相等性运算
      if (operator === '==') {
        result = this.performComparisonOperation(result, rightOperand, '==');
      } else if (operator === '!=') {
        result = this.performComparisonOperation(result, rightOperand, '!=');
      }
    }
    
    return result;
  }

  /**
   * 执行算术运算
   * @param left 左操作数
   * @param right 右操作数
   * @param operator 运算符
   * @returns 运算结果
   */
  private performArithmeticOperation(left: DicenicValue, right: DicenicValue, operator: string): DicenicValue {
    // 对于+运算符，检查是否应该进行字符串连接
    if (operator === '+') {
      // 如果其中一个操作数是非数字字符串，则进行字符串连接
      const leftIsNonNumericString = left.type === VariableType.STRING && isNaN(parseFloat(left.value as string));
      const rightIsNonNumericString = right.type === VariableType.STRING && isNaN(parseFloat(right.value as string));
      
      if (leftIsNonNumericString || rightIsNonNumericString) {
        // 进行字符串连接
        const leftStr = TypeConverter.toString(left);
        const rightStr = TypeConverter.toString(right);
        return {
          type: VariableType.STRING,
          value: leftStr + rightStr
        };
      }
    }
    
    // 将操作数转换为数字进行算术运算
    const leftNum = TypeConverter.toNumber(left);
    const rightNum = TypeConverter.toNumber(right);
    
    let result: number;
    
    switch (operator) {
      case '+':
        result = leftNum + rightNum;
        break;
      case '-':
        result = leftNum - rightNum;
        break;
      case '*':
        result = leftNum * rightNum;
        break;
      case '/':
        if (rightNum === 0) {
          this.errorHandler.addPublicWarning('Division by zero, returning 0');
          result = 0;
        } else {
          result = leftNum / rightNum;
        }
        break;
      case '%':
        if (rightNum === 0) {
          this.errorHandler.addPublicWarning('Modulo by zero, returning 0');
          result = 0;
        } else {
          result = leftNum % rightNum;
        }
        break;
      default:
        result = 0;
        break;
    }
    
    return {
      type: VariableType.NUMBER,
      value: result
    };
  }

  /**
   * 执行比较运算
   * @param left 左操作数
   * @param right 右操作数
   * @param operator 运算符
   * @returns 比较结果
   */
  private performComparisonOperation(left: DicenicValue, right: DicenicValue, operator: string): DicenicValue {
    let result: boolean;
    
    // 根据运算符类型决定比较方式
    if (operator === '==' || operator === '!=') {
      // 相等性比较：尝试转换为相同类型
      if (left.type === right.type) {
        // 相同类型直接比较
        result = left.value === right.value;
      } else {
        // 不同类型，转换为字符串比较
        const leftStr = TypeConverter.toString(left);
        const rightStr = TypeConverter.toString(right);
        result = leftStr === rightStr;
      }
      
      if (operator === '!=') {
        result = !result;
      }
    } else {
      // 关系比较：转换为数字比较
      const leftNum = TypeConverter.toNumber(left);
      const rightNum = TypeConverter.toNumber(right);
      
      switch (operator) {
        case '>':
          result = leftNum > rightNum;
          break;
        case '<':
          result = leftNum < rightNum;
          break;
        case '>=':
          result = leftNum >= rightNum;
          break;
        case '<=':
          result = leftNum <= rightNum;
          break;
        default:
          result = false;
          break;
      }
    }
    
    return {
      type: VariableType.NUMBER,
      value: result ? 1 : 0
    };
  }

  /**
   * 访问三元表达式节点
   * 实现条件运算符 condition ? trueValue : falseValue
   * @param ctx 三元表达式上下文
   * @returns 三元运算结果
   */
  visitTernaryExpression(ctx: TernaryExpressionContext): DicenicValue {
    // 获取条件表达式
    const condition = this.visit(ctx.logicalOrExpression());
    
    // 检查是否有三元运算符
    const questionToken = ctx.QUESTION();
    const colonToken = ctx.COLON();
    
    // 如果没有三元运算符，直接返回条件表达式的结果
    if (!questionToken || !colonToken) {
      return condition;
    }
    
    // 获取表达式列表
    const expressions = ctx.expression();
    if (expressions.length < 2) {
      return condition;
    }
    
    // 根据条件值决定执行哪个分支
    const conditionValue = TypeConverter.toBoolean(condition);
    
    if (conditionValue) {
      // 条件为真，执行第一个表达式（true分支）
      return this.visit(expressions[0]);
    } else {
      // 条件为假，执行第二个表达式（false分支）
      return this.visit(expressions[1]);
    }
  }

  /**
   * 访问逻辑或表达式节点
   * 实现短路求值：如果左操作数为true，则不计算右操作数
   * @param ctx 逻辑或表达式上下文
   * @returns 逻辑或运算结果
   */
  visitLogicalOrExpression(ctx: LogicalOrExpressionContext): DicenicValue {
    // 获取第一个操作数
    let result = this.visit(ctx.logicalAndExpression(0));
    
    // 处理后续的逻辑或运算
    const expressions = ctx.logicalAndExpression();
    for (let i = 1; i < expressions.length; i++) {
      // 短路求值：如果当前结果为true，直接返回
      if (TypeConverter.toBoolean(result)) {
        return {
          type: VariableType.NUMBER,
          value: 1
        };
      }
      
      // 计算右操作数
      const rightOperand = this.visit(ctx.logicalAndExpression(i));
      
      // 执行逻辑或运算
      const leftBool = TypeConverter.toBoolean(result);
      const rightBool = TypeConverter.toBoolean(rightOperand);
      
      result = {
        type: VariableType.NUMBER,
        value: (leftBool || rightBool) ? 1 : 0
      };
    }
    
    return result;
  }

  /**
   * 访问逻辑与表达式节点
   * 实现短路求值：如果左操作数为false，则不计算右操作数
   * @param ctx 逻辑与表达式上下文
   * @returns 逻辑与运算结果
   */
  visitLogicalAndExpression(ctx: LogicalAndExpressionContext): DicenicValue {
    // 获取第一个操作数
    let result = this.visit(ctx.equalityExpression(0));
    
    // 处理后续的逻辑与运算
    const expressions = ctx.equalityExpression();
    for (let i = 1; i < expressions.length; i++) {
      // 短路求值：如果当前结果为false，直接返回
      if (!TypeConverter.toBoolean(result)) {
        return {
          type: VariableType.NUMBER,
          value: 0
        };
      }
      
      // 计算右操作数
      const rightOperand = this.visit(ctx.equalityExpression(i));
      
      // 执行逻辑与运算
      const leftBool = TypeConverter.toBoolean(result);
      const rightBool = TypeConverter.toBoolean(rightOperand);
      
      result = {
        type: VariableType.NUMBER,
        value: (leftBool && rightBool) ? 1 : 0
      };
    }
    
    return result;
  }

  /**
   * 访问一元表达式节点
   * 支持逻辑非(!)、负号(-)和正号(+)运算符
   * @param ctx 一元表达式上下文
   * @returns 一元运算结果
   */
  visitUnaryExpression(ctx: UnaryExpressionContext): DicenicValue {
    // 检查是否有一元运算符
    const logicalNot = ctx.LOGICAL_NOT();
    const minus = ctx.MINUS();
    const plus = ctx.PLUS();
    
    if (logicalNot) {
      // 逻辑非运算
      const operand = this.visit(ctx.unaryExpression()!);
      const boolValue = TypeConverter.toBoolean(operand);
      
      return {
        type: VariableType.NUMBER,
        value: boolValue ? 0 : 1
      };
    } else if (minus) {
      // 负号运算
      const operand = this.visit(ctx.unaryExpression()!);
      const numValue = TypeConverter.toNumber(operand);
      
      return {
        type: VariableType.NUMBER,
        value: -numValue
      };
    } else if (plus) {
      // 正号运算（实际上不改变值，但确保转换为数字）
      const operand = this.visit(ctx.unaryExpression()!);
      const numValue = TypeConverter.toNumber(operand);
      
      return {
        type: VariableType.NUMBER,
        value: numValue
      };
    } else {
      // 没有一元运算符，访问赋值表达式
      const assignmentExpression = ctx.assignmentExpression();
      if (assignmentExpression) {
        return this.visit(assignmentExpression);
      }
    }
    
    return { type: VariableType.NUMBER, value: 0 };
  }

  /**
   * 访问赋值表达式节点
   * 支持基本赋值（=）和复合赋值（+=, -=, *=, /=, %=）
   * @param ctx 赋值表达式上下文
   * @returns 赋值结果
   */
  visitAssignmentExpression(ctx: AssignmentExpressionContext): DicenicValue {
    // 获取左操作数（被赋值的变量）
    const postfixExpression = ctx.postfixExpression();
    
    // 检查是否有赋值运算符
    const assignOp = ctx.ASSIGN();
    const plusAssignOp = ctx.PLUS_ASSIGN();
    const minusAssignOp = ctx.MINUS_ASSIGN();
    const multAssignOp = ctx.MULT_ASSIGN();
    const divAssignOp = ctx.DIV_ASSIGN();
    const modAssignOp = ctx.MOD_ASSIGN();
    
    // 如果没有赋值运算符，直接访问后缀表达式
    if (!assignOp && !plusAssignOp && !minusAssignOp && !multAssignOp && !divAssignOp && !modAssignOp) {
      return this.visit(postfixExpression);
    }
    
    // 获取右操作数（赋值的值）
    const rightExpression = ctx.expression();
    if (!rightExpression) {
      return this.visit(postfixExpression);
    }
    
    const rightValue = this.visit(rightExpression);
    
    // 确定赋值运算符类型
    let operator: string;
    if (assignOp) {
      operator = '=';
    } else if (plusAssignOp) {
      operator = '+=';
    } else if (minusAssignOp) {
      operator = '-=';
    } else if (multAssignOp) {
      operator = '*=';
    } else if (divAssignOp) {
      operator = '/=';
    } else if (modAssignOp) {
      operator = '%=';
    } else {
      return this.visit(postfixExpression);
    }
    
    // 执行赋值操作
    return this.performAssignment(postfixExpression, rightValue, operator);
  }

  /**
   * 访问后缀表达式节点
   * @param ctx 后缀表达式上下文
   * @returns 后缀表达式结果
   */
  visitPostfixExpression(ctx: PostfixExpressionContext): DicenicValue {
    // 后缀表达式目前只包含主表达式
    const primaryExpression = ctx.primaryExpression();
    return this.visit(primaryExpression);
  }

  /**
   * 默认访问方法，用于处理未实现的节点类型
   * @param tree 解析树节点
   * @returns 默认值
   */
  visitChildren(tree: ParseTree): DicenicValue {
    let result: DicenicValue = { type: VariableType.NUMBER, value: 0 };
    
    for (let i = 0; i < tree.childCount; i++) {
      const child = tree.getChild(i);
      if (child && !(child instanceof TerminalNode)) {
        result = this.visit(child);
      }
    }
    
    return result;
  }

  /**
   * 默认访问终端节点方法
   * @param node 终端节点
   * @returns 默认值
   */
  visitTerminal(node: TerminalNode): DicenicValue {
    return { type: VariableType.NUMBER, value: 0 };
  }

  /**
   * 默认访问错误节点方法
   * @param node 错误节点
   * @returns 默认值
   */
  visitErrorNode(node: any): DicenicValue {
    return { type: VariableType.NUMBER, value: 0 };
  }

  /**
   * 执行赋值操作
   * @param leftExpression 左操作数表达式（被赋值的变量）
   * @param rightValue 右操作数值
   * @param operator 赋值运算符
   * @returns 赋值结果
   */
  private performAssignment(leftExpression: PostfixExpressionContext, rightValue: DicenicValue, operator: string): DicenicValue {
    // 获取左操作数的主表达式
    const primaryExpression = leftExpression.primaryExpression();
    
    // 检查左操作数是否为标识符或特殊变量
    const identifier = primaryExpression.identifier();
    const specialVariable = primaryExpression.specialVariable();
    
    let finalValue: DicenicValue;
    
    if (operator === '=') {
      // 基本赋值：直接使用右操作数的值
      finalValue = rightValue;
    } else {
      // 复合赋值：需要先获取左操作数的当前值
      let currentValue: DicenicValue;
      
      if (identifier) {
        const varName = identifier.text;
        currentValue = this.context.getVariable(varName);
      } else if (specialVariable) {
        const text = specialVariable.text;
        if (text.startsWith('$') && text.length > 2) {
          const prefix = text.charAt(1);
          const name = text.substring(2);
          currentValue = this.context.getSpecialVariable(prefix, name);
        } else {
          currentValue = { type: VariableType.NUMBER, value: 0 };
        }
      } else {
        throw new Error('Invalid left-hand side in assignment');
      }
      
      // 根据复合赋值运算符执行相应的运算
      switch (operator) {
        case '+=':
          finalValue = this.performArithmeticOperation(currentValue, rightValue, '+');
          break;
        case '-=':
          finalValue = this.performArithmeticOperation(currentValue, rightValue, '-');
          break;
        case '*=':
          finalValue = this.performArithmeticOperation(currentValue, rightValue, '*');
          break;
        case '/=':
          finalValue = this.performArithmeticOperation(currentValue, rightValue, '/');
          break;
        case '%=':
          finalValue = this.performArithmeticOperation(currentValue, rightValue, '%');
          break;
        default:
          throw new Error(`Unknown assignment operator: ${operator}`);
      }
    }
    
    // 执行实际的赋值操作
    if (identifier) {
      // 普通变量赋值
      const varName = identifier.text;
      this.context.setVariable(varName, finalValue);
    } else if (specialVariable) {
      // 特殊变量赋值
      const text = specialVariable.text;
      if (text.startsWith('$') && text.length > 2) {
        const prefix = text.charAt(1);
        const name = text.substring(2);
        
        // 检查写入权限
        if (!this.context.canWriteSpecialVariable(prefix)) {
          this.errorHandler.handleVariableAccessError(
            `Cannot write to read-only variable: ${text}`,
            text,
            'write'
          );
          return finalValue; // 返回值但不执行赋值
        }
        
        try {
          this.context.setSpecialVariable(prefix, name, finalValue);
        } catch (error) {
          // 这里不应该发生，因为我们已经检查了权限
          this.errorHandler.handleVariableAccessError(
            error instanceof Error ? error.message : String(error),
            text,
            'write'
          );
          return finalValue;
        }
      } else {
        throw new Error(`Invalid special variable format: ${text}`);
      }
    } else {
      throw new Error('Invalid left-hand side in assignment');
    }
    
    return finalValue;
  }
}