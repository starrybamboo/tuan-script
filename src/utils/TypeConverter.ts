import { DicenicValue, VariableType } from '../interpreter/types';
import { TokenType } from '../types';

/**
 * 类型转换器 - 处理Dicenic语言中的各种类型转换逻辑
 */
export class TypeConverter {
  /**
   * 将DicenicValue转换为数字
   * @param value 要转换的值
   * @returns 转换后的数字，转换失败返回0
   */
  static toNumber(value: DicenicValue): number {
    switch (value.type) {
      case VariableType.NUMBER:
        return typeof value.value === 'number' ? value.value : 0;
      
      case VariableType.STRING:
        const stringValue = value.value as string;
        // 尝试解析字符串为数字
        const parsed = parseFloat(stringValue);
        return isNaN(parsed) ? 0 : parsed;
      
      case VariableType.DICE_EXPRESSION:
        // 掷骰表达式应该已经被计算为数字
        return typeof value.value === 'number' ? value.value : 0;
      
      default:
        return 0;
    }
  }

  /**
   * 将DicenicValue转换为字符串
   * @param value 要转换的值
   * @returns 转换后的字符串
   */
  static toString(value: DicenicValue): string {
    switch (value.type) {
      case VariableType.STRING:
        return value.value as string;
      
      case VariableType.NUMBER:
        const numValue = value.value as number;
        // 如果是整数，不显示小数点
        return Number.isInteger(numValue) ? numValue.toString() : numValue.toString();
      
      case VariableType.DICE_EXPRESSION:
        // 掷骰表达式转换为字符串显示结果
        return (value.value as number).toString();
      
      default:
        return '';
    }
  }

  /**
   * 将DicenicValue转换为布尔值
   * 根据需求：0和空字符串视为false，其余值视为true
   * @param value 要转换的值
   * @returns 转换后的布尔值
   */
  static toBoolean(value: DicenicValue): boolean {
    switch (value.type) {
      case VariableType.NUMBER:
        return (value.value as number) !== 0;
      
      case VariableType.STRING:
        return (value.value as string) !== '';
      
      case VariableType.DICE_EXPRESSION:
        return (value.value as number) !== 0;
      
      default:
        return false;
    }
  }

  /**
   * 将任意值转换为DicenicValue
   * @param value 要转换的值
   * @param targetType 目标类型（可选）
   * @returns DicenicValue对象
   */
  static toDicenicValue(value: any, targetType?: VariableType): DicenicValue {
    // 如果已经是DicenicValue，根据目标类型进行转换
    if (value && typeof value === 'object' && 'type' in value && 'value' in value) {
      const dicenicValue = value as DicenicValue;
      if (targetType && dicenicValue.type !== targetType) {
        return this.implicitConvert(dicenicValue, targetType);
      }
      return dicenicValue;
    }

    // 根据值的类型自动推断
    if (typeof value === 'number') {
      return {
        type: targetType || VariableType.NUMBER,
        value: value
      };
    }

    if (typeof value === 'string') {
      // 检查是否是掷骰表达式格式
      const diceMatch = value.match(/^(\d+)[dD](\d+)$/);
      if (diceMatch && targetType !== VariableType.STRING) {
        return {
          type: VariableType.DICE_EXPRESSION,
          value: value
        };
      }

      // 如果目标类型是数字，尝试解析
      if (targetType === VariableType.NUMBER) {
        const parsed = parseFloat(value);
        return {
          type: VariableType.NUMBER,
          value: isNaN(parsed) ? 0 : parsed
        };
      }

      return {
        type: targetType || VariableType.STRING,
        value: value
      };
    }

    if (typeof value === 'boolean') {
      if (targetType === VariableType.STRING) {
        return {
          type: VariableType.STRING,
          value: value.toString()
        };
      }
      return {
        type: VariableType.NUMBER,
        value: value ? 1 : 0
      };
    }

    // 默认返回空字符串
    return {
      type: targetType || VariableType.STRING,
      value: targetType === VariableType.NUMBER ? 0 : ''
    };
  }

  /**
   * 隐式类型转换
   * @param value 要转换的值
   * @param targetType 目标类型
   * @returns 转换后的DicenicValue
   */
  static implicitConvert(value: DicenicValue, targetType: VariableType): DicenicValue {
    if (value.type === targetType) {
      return value;
    }

    switch (targetType) {
      case VariableType.NUMBER:
        return {
          type: VariableType.NUMBER,
          value: this.toNumber(value)
        };
      
      case VariableType.STRING:
        return {
          type: VariableType.STRING,
          value: this.toString(value)
        };
      
      case VariableType.DICE_EXPRESSION:
        // 掷骰表达式类型比较特殊，只能从字符串转换
        if (value.type === VariableType.STRING) {
          const stringValue = value.value as string;
          const diceMatch = stringValue.match(/^(\d+)[dD](\d+)$/);
          if (diceMatch) {
            return {
              type: VariableType.DICE_EXPRESSION,
              value: stringValue
            };
          }
        }
        // 如果无法转换为掷骰表达式，转换为字符串
        return {
          type: VariableType.STRING,
          value: this.toString(value)
        };
      
      default:
        return value;
    }
  }

  /**
   * 为运算操作进行类型转换和协调
   * @param left 左操作数
   * @param right 右操作数
   * @param operator 运算符
   * @returns 转换后的操作数对
   */
  static convertForOperation(
    left: DicenicValue, 
    right: DicenicValue, 
    operator: TokenType
  ): [DicenicValue, DicenicValue] {
    // 比较运算符的特殊处理
    if (this.isComparisonOperator(operator)) {
      return this.convertForComparison(left, right);
    }

    // 逻辑运算符的特殊处理
    if (this.isLogicalOperator(operator)) {
      return this.convertForLogical(left, right);
    }

    // 算术运算符的处理（包括+运算符）
    if (this.isArithmeticOperator(operator)) {
      // 对于+运算符，需要判断是否为字符串连接
      if (operator === TokenType.PLUS) {
        // 如果其中一个操作数是非数字字符串（不能转换为数字），则进行字符串连接
        const leftIsNonNumericString = left.type === VariableType.STRING && isNaN(parseFloat(left.value as string));
        const rightIsNonNumericString = right.type === VariableType.STRING && isNaN(parseFloat(right.value as string));
        
        if (leftIsNonNumericString || rightIsNonNumericString) {
          return [
            this.implicitConvert(left, VariableType.STRING),
            this.implicitConvert(right, VariableType.STRING)
          ];
        }
      }
      
      return this.convertForArithmetic(left, right);
    }

    // 默认转换为数字
    return [
      this.implicitConvert(left, VariableType.NUMBER),
      this.implicitConvert(right, VariableType.NUMBER)
    ];
  }

  /**
   * 为比较运算转换类型
   */
  private static convertForComparison(left: DicenicValue, right: DicenicValue): [DicenicValue, DicenicValue] {
    // 如果两个操作数类型相同，直接返回
    if (left.type === right.type) {
      return [left, right];
    }

    // 如果其中一个是非数字字符串，都转换为字符串进行比较
    const leftIsNonNumericString = left.type === VariableType.STRING && isNaN(parseFloat(left.value as string));
    const rightIsNonNumericString = right.type === VariableType.STRING && isNaN(parseFloat(right.value as string));
    
    if (leftIsNonNumericString || rightIsNonNumericString) {
      return [
        this.implicitConvert(left, VariableType.STRING),
        this.implicitConvert(right, VariableType.STRING)
      ];
    }

    // 如果两个都可以转换为数字，转换为数字进行比较
    return [
      this.implicitConvert(left, VariableType.NUMBER),
      this.implicitConvert(right, VariableType.NUMBER)
    ];
  }

  /**
   * 为逻辑运算转换类型（转换为布尔值进行判断，但保持原值）
   */
  private static convertForLogical(left: DicenicValue, right: DicenicValue): [DicenicValue, DicenicValue] {
    // 逻辑运算不改变操作数的类型，只是在判断时转换为布尔值
    return [left, right];
  }

  /**
   * 为算术运算转换类型
   */
  private static convertForArithmetic(left: DicenicValue, right: DicenicValue): [DicenicValue, DicenicValue] {
    // 算术运算都转换为数字
    return [
      this.implicitConvert(left, VariableType.NUMBER),
      this.implicitConvert(right, VariableType.NUMBER)
    ];
  }

  /**
   * 判断是否是比较运算符
   */
  private static isComparisonOperator(operator: TokenType): boolean {
    return [
      TokenType.EQUAL,
      TokenType.NOT_EQUAL,
      TokenType.GREATER,
      TokenType.LESS,
      TokenType.GREATER_EQUAL,
      TokenType.LESS_EQUAL
    ].includes(operator);
  }

  /**
   * 判断是否是逻辑运算符
   */
  private static isLogicalOperator(operator: TokenType): boolean {
    return [
      TokenType.AND,
      TokenType.OR
    ].includes(operator);
  }

  /**
   * 判断是否是算术运算符
   */
  private static isArithmeticOperator(operator: TokenType): boolean {
    return [
      TokenType.PLUS,
      TokenType.MINUS,
      TokenType.MULTIPLY,
      TokenType.DIVIDE,
      TokenType.MODULO
    ].includes(operator);
  }

  /**
   * 获取类型的默认值
   * @param type 变量类型
   * @returns 该类型的默认值
   */
  static getDefaultValue(type: VariableType): DicenicValue {
    switch (type) {
      case VariableType.NUMBER:
        return { type: VariableType.NUMBER, value: 0 };
      
      case VariableType.STRING:
        return { type: VariableType.STRING, value: '' };
      
      case VariableType.DICE_EXPRESSION:
        return { type: VariableType.DICE_EXPRESSION, value: '1d1' };
      
      default:
        return { type: VariableType.STRING, value: '' };
    }
  }

  /**
   * 验证值是否符合指定类型
   * @param value 要验证的值
   * @param type 期望的类型
   * @returns 是否符合类型要求
   */
  static validateType(value: DicenicValue, type: VariableType): boolean {
    if (value.type !== type) {
      return false;
    }

    switch (type) {
      case VariableType.NUMBER:
        return typeof value.value === 'number' && !isNaN(value.value);
      
      case VariableType.STRING:
        return typeof value.value === 'string';
      
      case VariableType.DICE_EXPRESSION:
        if (typeof value.value === 'string') {
          return /^\d+[dD]\d+$/.test(value.value);
        }
        return typeof value.value === 'number';
      
      default:
        return false;
    }
  }
}