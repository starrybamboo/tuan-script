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
  EqualityExpressionContext
} from '../generated/DicenicParser';
import { ExecutionContext } from './ExecutionContext';
import { DicenicValue, VariableType } from './types';
import { TypeConverter } from '../utils/TypeConverter';
import { DiceCalculator } from '../utils/DiceCalculator';
import { StringInterpolator } from '../utils/StringInterpolator';
import { ParseTree } from 'antlr4ts/tree/ParseTree';
import { TerminalNode } from 'antlr4ts/tree/TerminalNode';

export class DicenicInterpreter implements DicenicVisitor<DicenicValue> {
  private context: ExecutionContext;
  private lastValue: DicenicValue;

  constructor(context?: ExecutionContext) {
    this.context = context || new ExecutionContext();
    this.lastValue = { type: VariableType.NUMBER, value: 0 };
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
    text = text.replace(/\\"/g, '"').replace(/\\'/g, "'").replace(/\\\\/g, '\\');
    
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
      console.warn(`Failed to evaluate dice expression: ${text}`, error);
      return { type: VariableType.NUMBER, value: 0 };
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
          console.warn('Division by zero, returning 0');
          result = 0;
        } else {
          result = leftNum / rightNum;
        }
        break;
      case '%':
        if (rightNum === 0) {
          console.warn('Modulo by zero, returning 0');
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
}