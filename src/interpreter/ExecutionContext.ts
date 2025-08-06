/**
 * 执行上下文管理类
 * 负责管理变量存储、访问权限控制和默认值处理
 */

import { DicenicValue, VariableType, SpecialVariablePrefix, ExecutionContextData } from './types';

export class ExecutionContext {
  // 角色卡属性（可读写）
  private attributes: Map<string, DicenicValue>;
  
  // 角色信息（只读）
  private roleInfo: Map<string, DicenicValue>;
  
  // 系统信息（只读）
  private systemInfo: Map<string, DicenicValue>;
  
  // 骰娘信息（可读写）
  private diceInfo: Map<string, DicenicValue>;
  
  // 局部变量
  private variables: Map<string, DicenicValue>;

  constructor(initialContext?: Partial<ExecutionContextData>) {
    this.attributes = initialContext?.attributes || new Map();
    this.roleInfo = initialContext?.roleInfo || new Map();
    this.systemInfo = initialContext?.systemInfo || new Map();
    this.diceInfo = initialContext?.diceInfo || new Map();
    this.variables = initialContext?.variables || new Map();
  }

  /**
   * 获取普通变量
   * @param name 变量名
   * @returns 变量值，如果不存在返回默认值
   */
  getVariable(name: string): DicenicValue {
    const value = this.variables.get(name);
    if (value !== undefined) {
      return value;
    }
    
    // 返回默认值：数字类型默认为0，字符串类型默认为空字符串
    return {
      type: VariableType.NUMBER,
      value: 0
    };
  }

  /**
   * 设置普通变量
   * @param name 变量名
   * @param value 变量值
   */
  setVariable(name: string, value: DicenicValue): void {
    this.variables.set(name, value);
  }

  /**
   * 获取特殊变量
   * @param prefix 特殊变量前缀 (a, r, s, d)
   * @param name 变量名
   * @returns 变量值
   */
  getSpecialVariable(prefix: string, name: string): DicenicValue {
    const storage = this.getStorageByPrefix(prefix);
    const value = storage.get(name);
    
    if (value !== undefined) {
      return value;
    }
    
    // 根据需求2.5：$r或$s类型变量未定义时默认返回0或空字符串
    if (prefix === SpecialVariablePrefix.ROLE || prefix === SpecialVariablePrefix.SYSTEM) {
      return {
        type: VariableType.STRING,
        value: ''
      };
    }
    
    // 其他类型变量默认返回数字0
    return {
      type: VariableType.NUMBER,
      value: 0
    };
  }

  /**
   * 设置特殊变量
   * @param prefix 特殊变量前缀 (a, r, s, d)
   * @param name 变量名
   * @param value 变量值
   * @throws Error 如果尝试写入只读变量
   */
  setSpecialVariable(prefix: string, name: string, value: DicenicValue): void {
    // 检查写入权限
    if (!this.canWriteSpecialVariable(prefix)) {
      throw new Error(`Cannot write to read-only variable: $${prefix}${name}`);
    }
    
    const storage = this.getStorageByPrefix(prefix);
    storage.set(name, value);
  }

  /**
   * 检查特殊变量是否可写
   * @param prefix 特殊变量前缀
   * @returns 是否可写
   */
  canWriteSpecialVariable(prefix: string): boolean {
    switch (prefix) {
      case SpecialVariablePrefix.ATTRIBUTE: // $a - 角色卡属性（可读写）
      case SpecialVariablePrefix.DICE:      // $d - 骰娘信息（可读写）
        return true;
      case SpecialVariablePrefix.ROLE:      // $r - 角色信息（只读）
      case SpecialVariablePrefix.SYSTEM:    // $s - 系统信息（只读）
        return false;
      default:
        return false;
    }
  }

  /**
   * 根据前缀获取对应的存储Map
   * @param prefix 特殊变量前缀
   * @returns 对应的存储Map
   */
  private getStorageByPrefix(prefix: string): Map<string, DicenicValue> {
    switch (prefix) {
      case SpecialVariablePrefix.ATTRIBUTE:
        return this.attributes;
      case SpecialVariablePrefix.ROLE:
        return this.roleInfo;
      case SpecialVariablePrefix.SYSTEM:
        return this.systemInfo;
      case SpecialVariablePrefix.DICE:
        return this.diceInfo;
      default:
        throw new Error(`Unknown special variable prefix: ${prefix}`);
    }
  }

  /**
   * 清空所有局部变量（保留特殊变量）
   */
  clearVariables(): void {
    this.variables.clear();
  }

  /**
   * 获取所有变量的快照（用于调试）
   */
  getSnapshot(): ExecutionContextData {
    return {
      attributes: new Map(this.attributes),
      roleInfo: new Map(this.roleInfo),
      systemInfo: new Map(this.systemInfo),
      diceInfo: new Map(this.diceInfo),
      variables: new Map(this.variables)
    };
  }

  /**
   * 检查变量是否存在
   * @param name 普通变量名
   * @returns 是否存在
   */
  hasVariable(name: string): boolean {
    return this.variables.has(name);
  }

  /**
   * 检查特殊变量是否存在
   * @param prefix 特殊变量前缀
   * @param name 变量名
   * @returns 是否存在
   */
  hasSpecialVariable(prefix: string, name: string): boolean {
    const storage = this.getStorageByPrefix(prefix);
    return storage.has(name);
  }
}