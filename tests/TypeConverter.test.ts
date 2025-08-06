import { TypeConverter } from '../src/utils/TypeConverter';
import { DicenicValue, VariableType } from '../src/interpreter/types';
import { TokenType } from '../src/types';

describe('TypeConverter', () => {
  describe('toNumber', () => {
    test('应该正确转换数字类型', () => {
      const value: DicenicValue = { type: VariableType.NUMBER, value: 42 };
      expect(TypeConverter.toNumber(value)).toBe(42);
    });

    test('应该正确转换小数', () => {
      const value: DicenicValue = { type: VariableType.NUMBER, value: 3.14 };
      expect(TypeConverter.toNumber(value)).toBe(3.14);
    });

    test('应该将数字字符串转换为数字', () => {
      const value: DicenicValue = { type: VariableType.STRING, value: '123' };
      expect(TypeConverter.toNumber(value)).toBe(123);
    });

    test('应该将小数字符串转换为数字', () => {
      const value: DicenicValue = { type: VariableType.STRING, value: '3.14' };
      expect(TypeConverter.toNumber(value)).toBe(3.14);
    });

    test('应该将无效字符串转换为0', () => {
      const value: DicenicValue = { type: VariableType.STRING, value: 'abc' };
      expect(TypeConverter.toNumber(value)).toBe(0);
    });

    test('应该将空字符串转换为0', () => {
      const value: DicenicValue = { type: VariableType.STRING, value: '' };
      expect(TypeConverter.toNumber(value)).toBe(0);
    });

    test('应该正确转换掷骰表达式结果', () => {
      const value: DicenicValue = { type: VariableType.DICE_EXPRESSION, value: 15 };
      expect(TypeConverter.toNumber(value)).toBe(15);
    });

    test('应该处理掷骰表达式中的无效值', () => {
      const value: DicenicValue = { type: VariableType.DICE_EXPRESSION, value: 'invalid' };
      expect(TypeConverter.toNumber(value)).toBe(0);
    });
  });

  describe('toString', () => {
    test('应该正确转换字符串类型', () => {
      const value: DicenicValue = { type: VariableType.STRING, value: 'hello' };
      expect(TypeConverter.toString(value)).toBe('hello');
    });

    test('应该将整数转换为字符串', () => {
      const value: DicenicValue = { type: VariableType.NUMBER, value: 42 };
      expect(TypeConverter.toString(value)).toBe('42');
    });

    test('应该将小数转换为字符串', () => {
      const value: DicenicValue = { type: VariableType.NUMBER, value: 3.14 };
      expect(TypeConverter.toString(value)).toBe('3.14');
    });

    test('应该将掷骰结果转换为字符串', () => {
      const value: DicenicValue = { type: VariableType.DICE_EXPRESSION, value: 18 };
      expect(TypeConverter.toString(value)).toBe('18');
    });

    test('应该处理零值', () => {
      const value: DicenicValue = { type: VariableType.NUMBER, value: 0 };
      expect(TypeConverter.toString(value)).toBe('0');
    });
  });

  describe('toBoolean', () => {
    test('应该将非零数字转换为true', () => {
      const value: DicenicValue = { type: VariableType.NUMBER, value: 42 };
      expect(TypeConverter.toBoolean(value)).toBe(true);
    });

    test('应该将零转换为false', () => {
      const value: DicenicValue = { type: VariableType.NUMBER, value: 0 };
      expect(TypeConverter.toBoolean(value)).toBe(false);
    });

    test('应该将非空字符串转换为true', () => {
      const value: DicenicValue = { type: VariableType.STRING, value: 'hello' };
      expect(TypeConverter.toBoolean(value)).toBe(true);
    });

    test('应该将空字符串转换为false', () => {
      const value: DicenicValue = { type: VariableType.STRING, value: '' };
      expect(TypeConverter.toBoolean(value)).toBe(false);
    });

    test('应该将非零掷骰结果转换为true', () => {
      const value: DicenicValue = { type: VariableType.DICE_EXPRESSION, value: 15 };
      expect(TypeConverter.toBoolean(value)).toBe(true);
    });

    test('应该将零掷骰结果转换为false', () => {
      const value: DicenicValue = { type: VariableType.DICE_EXPRESSION, value: 0 };
      expect(TypeConverter.toBoolean(value)).toBe(false);
    });
  });

  describe('toDicenicValue', () => {
    test('应该正确转换数字', () => {
      const result = TypeConverter.toDicenicValue(42);
      expect(result).toEqual({ type: VariableType.NUMBER, value: 42 });
    });

    test('应该正确转换字符串', () => {
      const result = TypeConverter.toDicenicValue('hello');
      expect(result).toEqual({ type: VariableType.STRING, value: 'hello' });
    });

    test('应该识别掷骰表达式', () => {
      const result = TypeConverter.toDicenicValue('3d6');
      expect(result).toEqual({ type: VariableType.DICE_EXPRESSION, value: '3d6' });
    });

    test('应该识别大写D的掷骰表达式', () => {
      const result = TypeConverter.toDicenicValue('2D10');
      expect(result).toEqual({ type: VariableType.DICE_EXPRESSION, value: '2D10' });
    });

    test('应该根据目标类型转换', () => {
      const result = TypeConverter.toDicenicValue('123', VariableType.NUMBER);
      expect(result).toEqual({ type: VariableType.NUMBER, value: 123 });
    });

    test('应该转换布尔值为数字', () => {
      const result = TypeConverter.toDicenicValue(true);
      expect(result).toEqual({ type: VariableType.NUMBER, value: 1 });
    });

    test('应该转换false为0', () => {
      const result = TypeConverter.toDicenicValue(false);
      expect(result).toEqual({ type: VariableType.NUMBER, value: 0 });
    });

    test('应该处理已经是DicenicValue的情况', () => {
      const original: DicenicValue = { type: VariableType.STRING, value: 'test' };
      const result = TypeConverter.toDicenicValue(original);
      expect(result).toEqual(original);
    });

    test('应该转换DicenicValue到目标类型', () => {
      const original: DicenicValue = { type: VariableType.STRING, value: '123' };
      const result = TypeConverter.toDicenicValue(original, VariableType.NUMBER);
      expect(result).toEqual({ type: VariableType.NUMBER, value: 123 });
    });
  });

  describe('implicitConvert', () => {
    test('应该保持相同类型不变', () => {
      const value: DicenicValue = { type: VariableType.NUMBER, value: 42 };
      const result = TypeConverter.implicitConvert(value, VariableType.NUMBER);
      expect(result).toEqual(value);
    });

    test('应该将字符串转换为数字', () => {
      const value: DicenicValue = { type: VariableType.STRING, value: '123' };
      const result = TypeConverter.implicitConvert(value, VariableType.NUMBER);
      expect(result).toEqual({ type: VariableType.NUMBER, value: 123 });
    });

    test('应该将数字转换为字符串', () => {
      const value: DicenicValue = { type: VariableType.NUMBER, value: 42 };
      const result = TypeConverter.implicitConvert(value, VariableType.STRING);
      expect(result).toEqual({ type: VariableType.STRING, value: '42' });
    });

    test('应该将有效字符串转换为掷骰表达式', () => {
      const value: DicenicValue = { type: VariableType.STRING, value: '3d6' };
      const result = TypeConverter.implicitConvert(value, VariableType.DICE_EXPRESSION);
      expect(result).toEqual({ type: VariableType.DICE_EXPRESSION, value: '3d6' });
    });

    test('应该将无效字符串转换为字符串而非掷骰表达式', () => {
      const value: DicenicValue = { type: VariableType.STRING, value: 'invalid' };
      const result = TypeConverter.implicitConvert(value, VariableType.DICE_EXPRESSION);
      expect(result).toEqual({ type: VariableType.STRING, value: 'invalid' });
    });

    test('应该将数字转换为掷骰表达式时转为字符串', () => {
      const value: DicenicValue = { type: VariableType.NUMBER, value: 42 };
      const result = TypeConverter.implicitConvert(value, VariableType.DICE_EXPRESSION);
      expect(result).toEqual({ type: VariableType.STRING, value: '42' });
    });
  });

  describe('convertForOperation', () => {
    test('应该为算术运算转换为数字', () => {
      const left: DicenicValue = { type: VariableType.STRING, value: '10' };
      const right: DicenicValue = { type: VariableType.STRING, value: '5' };
      const [convertedLeft, convertedRight] = TypeConverter.convertForOperation(left, right, TokenType.PLUS);
      
      expect(convertedLeft).toEqual({ type: VariableType.NUMBER, value: 10 });
      expect(convertedRight).toEqual({ type: VariableType.NUMBER, value: 5 });
    });

    test('应该为字符串连接保持字符串类型', () => {
      const left: DicenicValue = { type: VariableType.STRING, value: 'hello' };
      const right: DicenicValue = { type: VariableType.NUMBER, value: 42 };
      const [convertedLeft, convertedRight] = TypeConverter.convertForOperation(left, right, TokenType.PLUS);
      
      expect(convertedLeft).toEqual({ type: VariableType.STRING, value: 'hello' });
      expect(convertedRight).toEqual({ type: VariableType.STRING, value: '42' });
    });

    test('应该为比较运算转换为相同类型', () => {
      const left: DicenicValue = { type: VariableType.NUMBER, value: 10 };
      const right: DicenicValue = { type: VariableType.STRING, value: '5' };
      const [convertedLeft, convertedRight] = TypeConverter.convertForOperation(left, right, TokenType.GREATER);
      
      expect(convertedLeft).toEqual({ type: VariableType.NUMBER, value: 10 });
      expect(convertedRight).toEqual({ type: VariableType.NUMBER, value: 5 });
    });

    test('应该为字符串比较保持字符串类型', () => {
      const left: DicenicValue = { type: VariableType.STRING, value: 'abc' };
      const right: DicenicValue = { type: VariableType.NUMBER, value: 123 };
      const [convertedLeft, convertedRight] = TypeConverter.convertForOperation(left, right, TokenType.EQUAL);
      
      expect(convertedLeft).toEqual({ type: VariableType.STRING, value: 'abc' });
      expect(convertedRight).toEqual({ type: VariableType.STRING, value: '123' });
    });

    test('应该为逻辑运算保持原类型', () => {
      const left: DicenicValue = { type: VariableType.STRING, value: 'hello' };
      const right: DicenicValue = { type: VariableType.NUMBER, value: 42 };
      const [convertedLeft, convertedRight] = TypeConverter.convertForOperation(left, right, TokenType.AND);
      
      expect(convertedLeft).toEqual(left);
      expect(convertedRight).toEqual(right);
    });

    test('应该处理除法运算', () => {
      const left: DicenicValue = { type: VariableType.STRING, value: '20' };
      const right: DicenicValue = { type: VariableType.STRING, value: '4' };
      const [convertedLeft, convertedRight] = TypeConverter.convertForOperation(left, right, TokenType.DIVIDE);
      
      expect(convertedLeft).toEqual({ type: VariableType.NUMBER, value: 20 });
      expect(convertedRight).toEqual({ type: VariableType.NUMBER, value: 4 });
    });

    test('应该处理模运算', () => {
      const left: DicenicValue = { type: VariableType.STRING, value: '10' };
      const right: DicenicValue = { type: VariableType.STRING, value: '3' };
      const [convertedLeft, convertedRight] = TypeConverter.convertForOperation(left, right, TokenType.MODULO);
      
      expect(convertedLeft).toEqual({ type: VariableType.NUMBER, value: 10 });
      expect(convertedRight).toEqual({ type: VariableType.NUMBER, value: 3 });
    });
  });

  describe('getDefaultValue', () => {
    test('应该返回数字类型的默认值', () => {
      const result = TypeConverter.getDefaultValue(VariableType.NUMBER);
      expect(result).toEqual({ type: VariableType.NUMBER, value: 0 });
    });

    test('应该返回字符串类型的默认值', () => {
      const result = TypeConverter.getDefaultValue(VariableType.STRING);
      expect(result).toEqual({ type: VariableType.STRING, value: '' });
    });

    test('应该返回掷骰表达式类型的默认值', () => {
      const result = TypeConverter.getDefaultValue(VariableType.DICE_EXPRESSION);
      expect(result).toEqual({ type: VariableType.DICE_EXPRESSION, value: '1d1' });
    });
  });

  describe('validateType', () => {
    test('应该验证有效的数字类型', () => {
      const value: DicenicValue = { type: VariableType.NUMBER, value: 42 };
      expect(TypeConverter.validateType(value, VariableType.NUMBER)).toBe(true);
    });

    test('应该拒绝无效的数字类型', () => {
      const value: DicenicValue = { type: VariableType.NUMBER, value: NaN };
      expect(TypeConverter.validateType(value, VariableType.NUMBER)).toBe(false);
    });

    test('应该验证有效的字符串类型', () => {
      const value: DicenicValue = { type: VariableType.STRING, value: 'hello' };
      expect(TypeConverter.validateType(value, VariableType.STRING)).toBe(true);
    });

    test('应该拒绝类型不匹配的值', () => {
      const value: DicenicValue = { type: VariableType.STRING, value: 'hello' };
      expect(TypeConverter.validateType(value, VariableType.NUMBER)).toBe(false);
    });

    test('应该验证有效的掷骰表达式字符串', () => {
      const value: DicenicValue = { type: VariableType.DICE_EXPRESSION, value: '3d6' };
      expect(TypeConverter.validateType(value, VariableType.DICE_EXPRESSION)).toBe(true);
    });

    test('应该验证有效的掷骰表达式数字结果', () => {
      const value: DicenicValue = { type: VariableType.DICE_EXPRESSION, value: 15 };
      expect(TypeConverter.validateType(value, VariableType.DICE_EXPRESSION)).toBe(true);
    });

    test('应该拒绝无效的掷骰表达式格式', () => {
      const value: DicenicValue = { type: VariableType.DICE_EXPRESSION, value: 'invalid' };
      expect(TypeConverter.validateType(value, VariableType.DICE_EXPRESSION)).toBe(false);
    });

    test('应该验证大写D的掷骰表达式', () => {
      const value: DicenicValue = { type: VariableType.DICE_EXPRESSION, value: '2D10' };
      expect(TypeConverter.validateType(value, VariableType.DICE_EXPRESSION)).toBe(true);
    });
  });

  describe('边界情况和错误处理', () => {
    test('应该处理undefined值', () => {
      const result = TypeConverter.toDicenicValue(undefined);
      expect(result).toEqual({ type: VariableType.STRING, value: '' });
    });

    test('应该处理null值', () => {
      const result = TypeConverter.toDicenicValue(null);
      expect(result).toEqual({ type: VariableType.STRING, value: '' });
    });

    test('应该处理空对象', () => {
      const result = TypeConverter.toDicenicValue({});
      expect(result).toEqual({ type: VariableType.STRING, value: '' });
    });

    test('应该处理非常大的数字', () => {
      const value: DicenicValue = { type: VariableType.NUMBER, value: Number.MAX_SAFE_INTEGER };
      expect(TypeConverter.toString(value)).toBe(Number.MAX_SAFE_INTEGER.toString());
    });

    test('应该处理负数', () => {
      const value: DicenicValue = { type: VariableType.NUMBER, value: -42 };
      expect(TypeConverter.toString(value)).toBe('-42');
      expect(TypeConverter.toBoolean(value)).toBe(true);
    });

    test('应该处理科学计数法字符串', () => {
      const value: DicenicValue = { type: VariableType.STRING, value: '1e5' };
      expect(TypeConverter.toNumber(value)).toBe(100000);
    });

    test('应该处理带空格的数字字符串', () => {
      const value: DicenicValue = { type: VariableType.STRING, value: ' 123 ' };
      expect(TypeConverter.toNumber(value)).toBe(123);
    });
  });
});