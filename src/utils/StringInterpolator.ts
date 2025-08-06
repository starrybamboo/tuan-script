/**
 * 字符串插值处理器
 * 负责处理字符串中的变量插值，支持{$variable}语法
 */

import { ExecutionContext } from '../interpreter/ExecutionContext';
import { TypeConverter } from './TypeConverter';
import { InterpolationExpression } from '../interpreter/types';

export class StringInterpolator {
  /**
   * 处理字符串插值
   * @param template 包含插值表达式的模板字符串
   * @param context 执行上下文
   * @returns 插值后的字符串
   */
  static interpolate(template: string, context: ExecutionContext): string {
    if (!template || typeof template !== 'string') {
      return template || '';
    }

    // 解析插值表达式
    const expressions = this.parseInterpolationExpressions(template);
    
    if (expressions.length === 0) {
      return template;
    }

    // 从后往前替换，避免位置偏移问题
    let result = template;
    for (let i = expressions.length - 1; i >= 0; i--) {
      const expr = expressions[i];
      try {
        const value = this.evaluateExpression(expr.expression, context);
        result = result.substring(0, expr.start) + value + result.substring(expr.end);
      } catch (error) {
        // 如果表达式求值失败，保留原始表达式
        console.warn(`Failed to evaluate interpolation expression: ${expr.expression}`, error);
      }
    }

    return result;
  }

  /**
   * 解析字符串中的插值表达式
   * @param template 模板字符串
   * @returns 插值表达式数组
   */
  private static parseInterpolationExpressions(template: string): InterpolationExpression[] {
    const expressions: InterpolationExpression[] = [];
    const regex = /\{\$([^}]*)\}/g;
    let match;

    while ((match = regex.exec(template)) !== null) {
      expressions.push({
        start: match.index,
        end: match.index + match[0].length,
        expression: match[1] // 提取$后面的变量名部分
      });
    }

    return expressions;
  }

  /**
   * 求值插值表达式
   * @param expression 表达式字符串（不包含$前缀）
   * @param context 执行上下文
   * @returns 求值结果的字符串表示
   */
  private static evaluateExpression(expression: string, context: ExecutionContext): string {
    const trimmedExpr = expression.trim();
    
    if (!trimmedExpr) {
      return '';
    }

    // 检查是否为特殊变量（以a、r、s、d开头）
    if (this.isSpecialVariableExpression(trimmedExpr)) {
      return this.evaluateSpecialVariable(trimmedExpr, context);
    }

    // 处理普通变量
    return this.evaluateNormalVariable(trimmedExpr, context);
  }

  /**
   * 检查是否为特殊变量表达式
   * @param expression 表达式
   * @returns 是否为特殊变量
   */
  private static isSpecialVariableExpression(expression: string): boolean {
    // 特殊变量必须是单个字母(a,r,s,d)后跟中文字符、字母或下划线
    // 但不能是纯英文单词（如age, score等）
    if (expression.length < 2) return false;
    
    const firstChar = expression.charAt(0);
    if (!'arsd'.includes(firstChar)) return false;
    
    const restOfExpression = expression.substring(1);
    
    // 如果后面全是英文字母，则不是特殊变量（避免age, score等被误判）
    if (/^[a-zA-Z]+$/.test(restOfExpression)) {
      return false;
    }
    
    // 如果包含中文字符或以中文字符开头，则是特殊变量
    return /[\u4e00-\u9fa5]/.test(restOfExpression) || /^[_]/.test(restOfExpression);
  }

  /**
   * 求值特殊变量
   * @param expression 特殊变量表达式（如 "a力量", "r姓名"）
   * @param context 执行上下文
   * @returns 变量值的字符串表示
   */
  private static evaluateSpecialVariable(expression: string, context: ExecutionContext): string {
    const prefix = expression.charAt(0);
    const variableName = expression.substring(1);
    
    if (!variableName) {
      return '';
    }

    try {
      const value = context.getSpecialVariable(prefix, variableName);
      return TypeConverter.toString(value);
    } catch (error) {
      console.warn(`Failed to get special variable: $${expression}`, error);
      return '';
    }
  }

  /**
   * 求值普通变量
   * @param expression 普通变量名
   * @param context 执行上下文
   * @returns 变量值的字符串表示
   */
  private static evaluateNormalVariable(expression: string, context: ExecutionContext): string {
    try {
      const value = context.getVariable(expression);
      return TypeConverter.toString(value);
    } catch (error) {
      console.warn(`Failed to get variable: ${expression}`, error);
      return '';
    }
  }

  /**
   * 检查字符串是否包含插值表达式
   * @param template 模板字符串
   * @returns 是否包含插值表达式
   */
  static hasInterpolation(template: string): boolean {
    if (!template || typeof template !== 'string') {
      return false;
    }
    return /\{\$[^}]*\}/.test(template);
  }

  /**
   * 获取字符串中所有的插值变量名
   * @param template 模板字符串
   * @returns 变量名数组
   */
  static getInterpolationVariables(template: string): string[] {
    if (!template || typeof template !== 'string') {
      return [];
    }

    const expressions = this.parseInterpolationExpressions(template);
    return expressions.map(expr => expr.expression);
  }

  /**
   * 转义插值语法（用于在字符串中显示字面量的{$...}）
   * @param template 模板字符串
   * @returns 转义后的字符串
   */
  static escapeInterpolation(template: string): string {
    if (!template || typeof template !== 'string') {
      return template || '';
    }
    
    // 将{$替换为\{$，}替换为\}
    return template.replace(/\{\$/g, '\\{$').replace(/\}/g, '\\}');
  }

  /**
   * 反转义插值语法
   * @param template 包含转义字符的字符串
   * @returns 反转义后的字符串
   */
  static unescapeInterpolation(template: string): string {
    if (!template || typeof template !== 'string') {
      return template || '';
    }
    
    // 将\{$替换为{$，\}替换为}
    return template.replace(/\\\{\$/g, '{$').replace(/\\\}/g, '}');
  }

  /**
   * 验证插值表达式的语法
   * @param template 模板字符串
   * @returns 验证结果，包含是否有效和错误信息
   */
  static validateInterpolationSyntax(template: string): { isValid: boolean; errors: string[] } {
    const errors: string[] = [];
    
    if (!template || typeof template !== 'string') {
      return { isValid: true, errors: [] };
    }

    // 检查括号匹配
    let braceCount = 0;
    let inInterpolation = false;
    let currentStart = -1;

    for (let i = 0; i < template.length; i++) {
      const char = template[i];
      const nextChar = i < template.length - 1 ? template[i + 1] : '';

      if (char === '{' && nextChar === '$') {
        if (inInterpolation) {
          errors.push(`Nested interpolation not allowed at position ${i}`);
        }
        inInterpolation = true;
        currentStart = i;
        braceCount++;
        i++; // 跳过$
      } else if (char === '}' && inInterpolation) {
        braceCount--;
        inInterpolation = false;
        
        // 检查插值表达式是否为空
        const exprContent = template.substring(currentStart + 2, i);
        if (!exprContent.trim()) {
          errors.push(`Empty interpolation expression at position ${currentStart}`);
        }
      }
    }

    // 检查未闭合的括号
    if (braceCount > 0) {
      errors.push('Unclosed interpolation expression');
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }
}