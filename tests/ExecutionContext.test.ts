/**
 * ExecutionContext 单元测试
 * 测试执行上下文管理的各种功能
 */

import { ExecutionContext } from '../src/interpreter/ExecutionContext';
import { DicenicValue, VariableType, SpecialVariablePrefix } from '../src/interpreter/types';

describe('ExecutionContext', () => {
  let context: ExecutionContext;

  beforeEach(() => {
    context = new ExecutionContext();
  });

  describe('普通变量操作', () => {
    test('应该能够设置和获取普通变量', () => {
      const value: DicenicValue = { type: VariableType.NUMBER, value: 42 };
      context.setVariable('test', value);
      
      const result = context.getVariable('test');
      expect(result).toEqual(value);
    });

    test('获取不存在的普通变量应该返回默认值0', () => {
      const result = context.getVariable('nonexistent');
      expect(result).toEqual({
        type: VariableType.NUMBER,
        value: 0
      });
    });

    test('应该能够检查普通变量是否存在', () => {
      expect(context.hasVariable('test')).toBe(false);
      
      context.setVariable('test', { type: VariableType.NUMBER, value: 1 });
      expect(context.hasVariable('test')).toBe(true);
    });

    test('应该能够清空所有普通变量', () => {
      context.setVariable('var1', { type: VariableType.NUMBER, value: 1 });
      context.setVariable('var2', { type: VariableType.STRING, value: 'test' });
      
      expect(context.hasVariable('var1')).toBe(true);
      expect(context.hasVariable('var2')).toBe(true);
      
      context.clearVariables();
      
      expect(context.hasVariable('var1')).toBe(false);
      expect(context.hasVariable('var2')).toBe(false);
    });
  });

  describe('特殊变量操作', () => {
    describe('角色卡属性变量 ($a)', () => {
      test('应该能够读写$a变量', () => {
        const value: DicenicValue = { type: VariableType.NUMBER, value: 15 };
        
        expect(() => {
          context.setSpecialVariable(SpecialVariablePrefix.ATTRIBUTE, '力量', value);
        }).not.toThrow();
        
        const result = context.getSpecialVariable(SpecialVariablePrefix.ATTRIBUTE, '力量');
        expect(result).toEqual(value);
      });

      test('$a变量应该支持中文变量名', () => {
        const value: DicenicValue = { type: VariableType.NUMBER, value: 18 };
        context.setSpecialVariable(SpecialVariablePrefix.ATTRIBUTE, '敏捷', value);
        
        const result = context.getSpecialVariable(SpecialVariablePrefix.ATTRIBUTE, '敏捷');
        expect(result).toEqual(value);
      });

      test('获取不存在的$a变量应该返回默认值0', () => {
        const result = context.getSpecialVariable(SpecialVariablePrefix.ATTRIBUTE, '不存在');
        expect(result).toEqual({
          type: VariableType.NUMBER,
          value: 0
        });
      });
    });

    describe('角色信息变量 ($r)', () => {
      test('$r变量应该只读', () => {
        expect(context.canWriteSpecialVariable(SpecialVariablePrefix.ROLE)).toBe(false);
        
        expect(() => {
          context.setSpecialVariable(SpecialVariablePrefix.ROLE, 'name', {
            type: VariableType.STRING,
            value: 'test'
          });
        }).toThrow('Cannot write to read-only variable: $rname');
      });

      test('获取不存在的$r变量应该返回空字符串', () => {
        const result = context.getSpecialVariable(SpecialVariablePrefix.ROLE, '姓名');
        expect(result).toEqual({
          type: VariableType.STRING,
          value: ''
        });
      });
    });

    describe('系统信息变量 ($s)', () => {
      test('$s变量应该只读', () => {
        expect(context.canWriteSpecialVariable(SpecialVariablePrefix.SYSTEM)).toBe(false);
        
        expect(() => {
          context.setSpecialVariable(SpecialVariablePrefix.SYSTEM, 'version', {
            type: VariableType.STRING,
            value: '1.0'
          });
        }).toThrow('Cannot write to read-only variable: $sversion');
      });

      test('获取不存在的$s变量应该返回空字符串', () => {
        const result = context.getSpecialVariable(SpecialVariablePrefix.SYSTEM, '版本');
        expect(result).toEqual({
          type: VariableType.STRING,
          value: ''
        });
      });
    });

    describe('骰娘信息变量 ($d)', () => {
      test('应该能够读写$d变量', () => {
        const value: DicenicValue = { type: VariableType.STRING, value: '骰娘名称' };
        
        expect(() => {
          context.setSpecialVariable(SpecialVariablePrefix.DICE, 'name', value);
        }).not.toThrow();
        
        const result = context.getSpecialVariable(SpecialVariablePrefix.DICE, 'name');
        expect(result).toEqual(value);
      });

      test('获取不存在的$d变量应该返回默认值0', () => {
        const result = context.getSpecialVariable(SpecialVariablePrefix.DICE, '不存在');
        expect(result).toEqual({
          type: VariableType.NUMBER,
          value: 0
        });
      });
    });

    test('应该能够检查特殊变量是否存在', () => {
      expect(context.hasSpecialVariable(SpecialVariablePrefix.ATTRIBUTE, '力量')).toBe(false);
      
      context.setSpecialVariable(SpecialVariablePrefix.ATTRIBUTE, '力量', {
        type: VariableType.NUMBER,
        value: 15
      });
      
      expect(context.hasSpecialVariable(SpecialVariablePrefix.ATTRIBUTE, '力量')).toBe(true);
    });

    test('未知的特殊变量前缀应该抛出错误', () => {
      expect(() => {
        context.getSpecialVariable('x', 'test');
      }).toThrow('Unknown special variable prefix: x');
    });
  });

  describe('权限控制', () => {
    test('canWriteSpecialVariable应该正确返回权限', () => {
      expect(context.canWriteSpecialVariable(SpecialVariablePrefix.ATTRIBUTE)).toBe(true);
      expect(context.canWriteSpecialVariable(SpecialVariablePrefix.DICE)).toBe(true);
      expect(context.canWriteSpecialVariable(SpecialVariablePrefix.ROLE)).toBe(false);
      expect(context.canWriteSpecialVariable(SpecialVariablePrefix.SYSTEM)).toBe(false);
      expect(context.canWriteSpecialVariable('unknown')).toBe(false);
    });
  });

  describe('初始化和快照', () => {
    test('应该能够使用初始数据创建上下文', () => {
      const initialData = {
        attributes: new Map([['力量', { type: VariableType.NUMBER, value: 15 }]]),
        variables: new Map([['test', { type: VariableType.STRING, value: 'hello' }]])
      };
      
      const contextWithData = new ExecutionContext(initialData);
      
      expect(contextWithData.getSpecialVariable(SpecialVariablePrefix.ATTRIBUTE, '力量')).toEqual({
        type: VariableType.NUMBER,
        value: 15
      });
      
      expect(contextWithData.getVariable('test')).toEqual({
        type: VariableType.STRING,
        value: 'hello'
      });
    });

    test('应该能够获取变量快照', () => {
      context.setVariable('var1', { type: VariableType.NUMBER, value: 1 });
      context.setSpecialVariable(SpecialVariablePrefix.ATTRIBUTE, '力量', {
        type: VariableType.NUMBER,
        value: 15
      });
      
      const snapshot = context.getSnapshot();
      
      expect(snapshot.variables.get('var1')).toEqual({
        type: VariableType.NUMBER,
        value: 1
      });
      
      expect(snapshot.attributes.get('力量')).toEqual({
        type: VariableType.NUMBER,
        value: 15
      });
      
      // 快照应该是独立的副本
      context.setVariable('var1', { type: VariableType.NUMBER, value: 2 });
      expect(snapshot.variables.get('var1')).toEqual({
        type: VariableType.NUMBER,
        value: 1
      });
    });

    test('clearVariables应该只清空普通变量，保留特殊变量', () => {
      context.setVariable('var1', { type: VariableType.NUMBER, value: 1 });
      context.setSpecialVariable(SpecialVariablePrefix.ATTRIBUTE, '力量', {
        type: VariableType.NUMBER,
        value: 15
      });
      
      context.clearVariables();
      
      expect(context.hasVariable('var1')).toBe(false);
      expect(context.hasSpecialVariable(SpecialVariablePrefix.ATTRIBUTE, '力量')).toBe(true);
    });
  });

  describe('需求验证', () => {
    test('需求2.1: $a前缀变量应该支持读写操作', () => {
      const value: DicenicValue = { type: VariableType.NUMBER, value: 15 };
      
      // 写入操作
      expect(() => {
        context.setSpecialVariable(SpecialVariablePrefix.ATTRIBUTE, '力量', value);
      }).not.toThrow();
      
      // 读取操作
      const result = context.getSpecialVariable(SpecialVariablePrefix.ATTRIBUTE, '力量');
      expect(result).toEqual(value);
    });

    test('需求2.2: $r前缀变量应该仅支持只读操作', () => {
      expect(context.canWriteSpecialVariable(SpecialVariablePrefix.ROLE)).toBe(false);
      
      expect(() => {
        context.setSpecialVariable(SpecialVariablePrefix.ROLE, 'name', {
          type: VariableType.STRING,
          value: 'test'
        });
      }).toThrow();
    });

    test('需求2.3: $s前缀变量应该仅支持只读操作', () => {
      expect(context.canWriteSpecialVariable(SpecialVariablePrefix.SYSTEM)).toBe(false);
      
      expect(() => {
        context.setSpecialVariable(SpecialVariablePrefix.SYSTEM, 'version', {
          type: VariableType.STRING,
          value: '1.0'
        });
      }).toThrow();
    });

    test('需求2.4: $d前缀变量应该支持读写操作', () => {
      const value: DicenicValue = { type: VariableType.STRING, value: '骰娘' };
      
      // 写入操作
      expect(() => {
        context.setSpecialVariable(SpecialVariablePrefix.DICE, 'name', value);
      }).not.toThrow();
      
      // 读取操作
      const result = context.getSpecialVariable(SpecialVariablePrefix.DICE, 'name');
      expect(result).toEqual(value);
    });

    test('需求2.5: $r或$s类型变量未定义时应该默认返回空字符串', () => {
      const roleResult = context.getSpecialVariable(SpecialVariablePrefix.ROLE, '未定义');
      expect(roleResult).toEqual({
        type: VariableType.STRING,
        value: ''
      });
      
      const systemResult = context.getSpecialVariable(SpecialVariablePrefix.SYSTEM, '未定义');
      expect(systemResult).toEqual({
        type: VariableType.STRING,
        value: ''
      });
    });
  });
});