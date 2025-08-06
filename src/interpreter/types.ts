/**
 * Dicenic脚本语言的核心类型定义
 */

// 变量类型枚举
export enum VariableType {
  NUMBER = 'NUMBER',
  STRING = 'STRING',
  DICE_EXPRESSION = 'DICE_EXPRESSION'
}

// Dicenic值接口
export interface DicenicValue {
  type: VariableType;
  value: number | string;
}

// 特殊变量前缀枚举
export enum SpecialVariablePrefix {
  ATTRIBUTE = 'a',    // $a - 角色卡属性（可读写）
  ROLE = 'r',         // $r - 角色信息（只读）
  SYSTEM = 's',       // $s - 系统信息（只读）
  DICE = 'd'          // $d - 骰娘信息（可读写）
}

// 执行上下文数据接口
export interface ExecutionContextData {
  attributes: Map<string, DicenicValue>;
  roleInfo: Map<string, DicenicValue>;
  systemInfo: Map<string, DicenicValue>;
  diceInfo: Map<string, DicenicValue>;
  variables: Map<string, DicenicValue>;
}

// 字符串插值表达式接口
export interface InterpolationExpression {
  start: number;
  end: number;
  expression: string;
}