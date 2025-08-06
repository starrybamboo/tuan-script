/**
 * DiceCalculator 单元测试
 * 测试掷骰计算器的各种功能
 */

import { DiceCalculator } from '../src/utils/DiceCalculator';
import { VariableType } from '../src/interpreter/types';

describe('DiceCalculator', () => {
  describe('calculate', () => {
    test('应该计算简单的掷骰表达式', () => {
      const result = DiceCalculator.calculate(1, 6);
      expect(result).toBeGreaterThanOrEqual(1);
      expect(result).toBeLessThanOrEqual(6);
    });

    test('应该计算多个骰子的掷骰表达式', () => {
      const result = DiceCalculator.calculate(3, 6);
      expect(result).toBeGreaterThanOrEqual(3);
      expect(result).toBeLessThanOrEqual(18);
    });

    test('应该计算大面数骰子', () => {
      const result = DiceCalculator.calculate(1, 100);
      expect(result).toBeGreaterThanOrEqual(1);
      expect(result).toBeLessThanOrEqual(100);
    });

    test('应该拒绝无效的掷骰次数', () => {
      expect(() => DiceCalculator.calculate(0, 6)).toThrow('Invalid dice expression: 0d6');
      expect(() => DiceCalculator.calculate(-1, 6)).toThrow('Invalid dice expression: -1d6');
    });

    test('应该拒绝无效的骰子面数', () => {
      expect(() => DiceCalculator.calculate(1, 0)).toThrow('Invalid dice expression: 1d0');
      expect(() => DiceCalculator.calculate(1, -1)).toThrow('Invalid dice expression: 1d-1');
    });

    test('应该拒绝非整数参数', () => {
      expect(() => DiceCalculator.calculate(1.5, 6)).toThrow('Invalid dice expression: 1.5d6');
      expect(() => DiceCalculator.calculate(1, 6.5)).toThrow('Invalid dice expression: 1d6.5');
    });

    test('应该拒绝超过限制的参数', () => {
      expect(() => DiceCalculator.calculate(1001, 6)).toThrow('Invalid dice expression: 1001d6');
      expect(() => DiceCalculator.calculate(1, 10001)).toThrow('Invalid dice expression: 1d10001');
    });

    test('多次掷骰结果应该在合理范围内', () => {
      const results = [];
      for (let i = 0; i < 100; i++) {
        results.push(DiceCalculator.calculate(2, 6));
      }
      
      // 所有结果都应该在2-12之间
      results.forEach(result => {
        expect(result).toBeGreaterThanOrEqual(2);
        expect(result).toBeLessThanOrEqual(12);
      });
      
      // 应该有一定的随机性（不是所有结果都相同）
      const uniqueResults = new Set(results);
      expect(uniqueResults.size).toBeGreaterThan(1);
    });
  });

  describe('parseDiceExpression', () => {
    test('应该解析标准的掷骰表达式', () => {
      const result = DiceCalculator.parseDiceExpression('3d6');
      expect(result).toEqual({ count: 3, sides: 6 });
    });

    test('应该解析大写D的掷骰表达式', () => {
      const result = DiceCalculator.parseDiceExpression('2D10');
      expect(result).toEqual({ count: 2, sides: 10 });
    });

    test('应该解析带空格的掷骰表达式', () => {
      const result = DiceCalculator.parseDiceExpression(' 1d20 ');
      expect(result).toEqual({ count: 1, sides: 20 });
    });

    test('应该解析大数字的掷骰表达式', () => {
      const result = DiceCalculator.parseDiceExpression('100d100');
      expect(result).toEqual({ count: 100, sides: 100 });
    });

    test('应该拒绝无效格式的表达式', () => {
      expect(() => DiceCalculator.parseDiceExpression('3x6')).toThrow('Invalid dice expression format: 3x6');
      expect(() => DiceCalculator.parseDiceExpression('d6')).toThrow('Invalid dice expression format: d6');
      expect(() => DiceCalculator.parseDiceExpression('3d')).toThrow('Invalid dice expression format: 3d');
      expect(() => DiceCalculator.parseDiceExpression('abc')).toThrow('Invalid dice expression format: abc');
      expect(() => DiceCalculator.parseDiceExpression('')).toThrow('Invalid dice expression format: ');
    });

    test('应该拒绝包含小数的表达式', () => {
      expect(() => DiceCalculator.parseDiceExpression('3.5d6')).toThrow('Invalid dice expression format: 3.5d6');
      expect(() => DiceCalculator.parseDiceExpression('3d6.5')).toThrow('Invalid dice expression format: 3d6.5');
    });

    test('应该拒绝负数表达式', () => {
      expect(() => DiceCalculator.parseDiceExpression('-3d6')).toThrow('Invalid dice expression format: -3d6');
      expect(() => DiceCalculator.parseDiceExpression('3d-6')).toThrow('Invalid dice expression format: 3d-6');
    });
  });

  describe('validateDiceExpression', () => {
    test('应该验证有效的掷骰表达式', () => {
      expect(DiceCalculator.validateDiceExpression(1, 6)).toBe(true);
      expect(DiceCalculator.validateDiceExpression(3, 6)).toBe(true);
      expect(DiceCalculator.validateDiceExpression(100, 100)).toBe(true);
      expect(DiceCalculator.validateDiceExpression(1000, 10000)).toBe(true);
    });

    test('应该拒绝无效的掷骰次数', () => {
      expect(DiceCalculator.validateDiceExpression(0, 6)).toBe(false);
      expect(DiceCalculator.validateDiceExpression(-1, 6)).toBe(false);
      expect(DiceCalculator.validateDiceExpression(1.5, 6)).toBe(false);
    });

    test('应该拒绝无效的骰子面数', () => {
      expect(DiceCalculator.validateDiceExpression(1, 0)).toBe(false);
      expect(DiceCalculator.validateDiceExpression(1, -1)).toBe(false);
      expect(DiceCalculator.validateDiceExpression(1, 6.5)).toBe(false);
    });

    test('应该拒绝超过限制的参数', () => {
      expect(DiceCalculator.validateDiceExpression(1001, 6)).toBe(false);
      expect(DiceCalculator.validateDiceExpression(1, 10001)).toBe(false);
    });
  });

  describe('isDiceExpression', () => {
    test('应该识别有效的掷骰表达式', () => {
      expect(DiceCalculator.isDiceExpression('1d6')).toBe(true);
      expect(DiceCalculator.isDiceExpression('3d6')).toBe(true);
      expect(DiceCalculator.isDiceExpression('2D10')).toBe(true);
      expect(DiceCalculator.isDiceExpression(' 1d20 ')).toBe(true);
    });

    test('应该拒绝无效的掷骰表达式', () => {
      expect(DiceCalculator.isDiceExpression('3x6')).toBe(false);
      expect(DiceCalculator.isDiceExpression('d6')).toBe(false);
      expect(DiceCalculator.isDiceExpression('3d')).toBe(false);
      expect(DiceCalculator.isDiceExpression('abc')).toBe(false);
      expect(DiceCalculator.isDiceExpression('')).toBe(false);
      expect(DiceCalculator.isDiceExpression('3.5d6')).toBe(false);
      expect(DiceCalculator.isDiceExpression('0d6')).toBe(false);
      expect(DiceCalculator.isDiceExpression('1d0')).toBe(false);
    });
  });

  describe('evaluateDiceExpression', () => {
    test('应该计算掷骰表达式并返回DicenicValue', () => {
      const result = DiceCalculator.evaluateDiceExpression('1d6');
      
      expect(result.type).toBe(VariableType.DICE_EXPRESSION);
      expect(typeof result.value).toBe('number');
      expect(result.value as number).toBeGreaterThanOrEqual(1);
      expect(result.value as number).toBeLessThanOrEqual(6);
    });

    test('应该处理多个骰子的表达式', () => {
      const result = DiceCalculator.evaluateDiceExpression('3d6');
      
      expect(result.type).toBe(VariableType.DICE_EXPRESSION);
      expect(typeof result.value).toBe('number');
      expect(result.value as number).toBeGreaterThanOrEqual(3);
      expect(result.value as number).toBeLessThanOrEqual(18);
    });

    test('应该处理大写D的表达式', () => {
      const result = DiceCalculator.evaluateDiceExpression('2D10');
      
      expect(result.type).toBe(VariableType.DICE_EXPRESSION);
      expect(typeof result.value).toBe('number');
      expect(result.value as number).toBeGreaterThanOrEqual(2);
      expect(result.value as number).toBeLessThanOrEqual(20);
    });

    test('应该拒绝无效的表达式', () => {
      expect(() => DiceCalculator.evaluateDiceExpression('invalid')).toThrow();
      expect(() => DiceCalculator.evaluateDiceExpression('0d6')).toThrow();
    });
  });

  describe('createDiceValue', () => {
    test('应该创建掷骰表达式的DicenicValue', () => {
      const result = DiceCalculator.createDiceValue(1, 6);
      
      expect(result.type).toBe(VariableType.DICE_EXPRESSION);
      expect(typeof result.value).toBe('number');
      expect(result.value as number).toBeGreaterThanOrEqual(1);
      expect(result.value as number).toBeLessThanOrEqual(6);
    });

    test('应该拒绝无效参数', () => {
      expect(() => DiceCalculator.createDiceValue(0, 6)).toThrow();
      expect(() => DiceCalculator.createDiceValue(1, 0)).toThrow();
    });
  });

  describe('统计方法', () => {
    test('getMinValue应该返回正确的最小值', () => {
      expect(DiceCalculator.getMinValue(1, 6)).toBe(1);
      expect(DiceCalculator.getMinValue(3, 6)).toBe(3);
      expect(DiceCalculator.getMinValue(2, 10)).toBe(2);
    });

    test('getMaxValue应该返回正确的最大值', () => {
      expect(DiceCalculator.getMaxValue(1, 6)).toBe(6);
      expect(DiceCalculator.getMaxValue(3, 6)).toBe(18);
      expect(DiceCalculator.getMaxValue(2, 10)).toBe(20);
    });

    test('getAverageValue应该返回正确的平均值', () => {
      expect(DiceCalculator.getAverageValue(1, 6)).toBe(3.5);
      expect(DiceCalculator.getAverageValue(2, 6)).toBe(7);
      expect(DiceCalculator.getAverageValue(1, 10)).toBe(5.5);
    });
  });

  describe('需求验证', () => {
    test('需求1.3: 应该正确识别和处理掷骰表达式', () => {
      // 测试'd'运算符的识别
      expect(DiceCalculator.isDiceExpression('3d6')).toBe(true);
      expect(DiceCalculator.isDiceExpression('1D20')).toBe(true);
      
      // 测试只支持整数
      expect(DiceCalculator.isDiceExpression('3.5d6')).toBe(false);
      expect(DiceCalculator.isDiceExpression('3d6.5')).toBe(false);
      
      // 测试计算结果
      const result = DiceCalculator.evaluateDiceExpression('2d6');
      expect(result.type).toBe(VariableType.DICE_EXPRESSION);
      expect(result.value as number).toBeGreaterThanOrEqual(2);
      expect(result.value as number).toBeLessThanOrEqual(12);
    });

    test('应该支持中文环境下的掷骰计算', () => {
      // 测试在中文环境下掷骰表达式仍然正常工作
      const result = DiceCalculator.calculate(3, 6);
      expect(result).toBeGreaterThanOrEqual(3);
      expect(result).toBeLessThanOrEqual(18);
    });

    test('应该提供合理的参数验证', () => {
      // 测试参数验证防止恶意输入
      expect(() => DiceCalculator.calculate(1001, 6)).toThrow();
      expect(() => DiceCalculator.calculate(1, 10001)).toThrow();
      expect(() => DiceCalculator.calculate(-1, 6)).toThrow();
      expect(() => DiceCalculator.calculate(1, -1)).toThrow();
    });
  });
});