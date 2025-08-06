/**
 * 掷骰计算器
 * 负责解析和计算掷骰表达式
 */

import { DicenicValue, VariableType } from '../interpreter/types';

export class DiceCalculator {
  // 最大掷骰次数限制，防止性能问题
  private static readonly MAX_DICE_COUNT = 1000;
  // 最大骰子面数限制
  private static readonly MAX_DICE_SIDES = 10000;

  /**
   * 计算掷骰结果
   * @param count 掷骰次数
   * @param sides 骰子面数
   * @returns 掷骰结果总和
   */
  static calculate(count: number, sides: number): number {
    // 验证参数
    if (!this.validateDiceExpression(count, sides)) {
      throw new Error(`Invalid dice expression: ${count}d${sides}`);
    }

    let total = 0;
    for (let i = 0; i < count; i++) {
      // 生成1到sides之间的随机数
      total += Math.floor(Math.random() * sides) + 1;
    }

    return total;
  }

  /**
   * 解析掷骰表达式字符串
   * @param expression 掷骰表达式字符串，如 "3d6" 或 "2D10"
   * @returns 解析结果包含掷骰次数和面数
   */
  static parseDiceExpression(expression: string): { count: number, sides: number } {
    // 移除空格并转换为小写
    const cleanExpression = expression.trim().toLowerCase();
    
    // 匹配掷骰表达式格式：数字d数字
    const diceRegex = /^(\d+)d(\d+)$/;
    const match = cleanExpression.match(diceRegex);
    
    if (!match) {
      throw new Error(`Invalid dice expression format: ${expression}`);
    }

    const count = parseInt(match[1], 10);
    const sides = parseInt(match[2], 10);

    return { count, sides };
  }

  /**
   * 验证掷骰表达式参数的有效性
   * @param count 掷骰次数
   * @param sides 骰子面数
   * @returns 是否有效
   */
  static validateDiceExpression(count: number, sides: number): boolean {
    // 检查是否为正整数
    if (!Number.isInteger(count) || !Number.isInteger(sides)) {
      return false;
    }

    // 检查是否为正数
    if (count <= 0 || sides <= 0) {
      return false;
    }

    // 检查是否超过限制
    if (count > this.MAX_DICE_COUNT || sides > this.MAX_DICE_SIDES) {
      return false;
    }

    return true;
  }

  /**
   * 检查字符串是否为有效的掷骰表达式
   * @param expression 要检查的字符串
   * @returns 是否为有效的掷骰表达式
   */
  static isDiceExpression(expression: string): boolean {
    try {
      const { count, sides } = this.parseDiceExpression(expression);
      return this.validateDiceExpression(count, sides);
    } catch {
      return false;
    }
  }

  /**
   * 计算掷骰表达式并返回DicenicValue
   * @param expression 掷骰表达式字符串
   * @returns 计算结果的DicenicValue
   */
  static evaluateDiceExpression(expression: string): DicenicValue {
    const { count, sides } = this.parseDiceExpression(expression);
    const result = this.calculate(count, sides);
    
    return {
      type: VariableType.DICE_EXPRESSION,
      value: result
    };
  }

  /**
   * 从数字创建掷骰表达式（用于类型转换）
   * @param count 掷骰次数
   * @param sides 骰子面数
   * @returns 掷骰表达式的DicenicValue
   */
  static createDiceValue(count: number, sides: number): DicenicValue {
    const result = this.calculate(count, sides);
    
    return {
      type: VariableType.DICE_EXPRESSION,
      value: result
    };
  }

  /**
   * 获取掷骰表达式的理论最小值
   * @param count 掷骰次数
   * @param sides 骰子面数
   * @returns 理论最小值
   */
  static getMinValue(count: number, sides: number): number {
    return count; // 每个骰子最小值为1
  }

  /**
   * 获取掷骰表达式的理论最大值
   * @param count 掷骰次数
   * @param sides 骰子面数
   * @returns 理论最大值
   */
  static getMaxValue(count: number, sides: number): number {
    return count * sides;
  }

  /**
   * 获取掷骰表达式的理论平均值
   * @param count 掷骰次数
   * @param sides 骰子面数
   * @returns 理论平均值
   */
  static getAverageValue(count: number, sides: number): number {
    return count * (sides + 1) / 2;
  }
}