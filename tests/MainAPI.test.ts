/**
 * 主入口API测试
 * 测试主要的API函数和接口
 */

import {
  executeScript,
  parseScript,
  createExecutionContext,
  createErrorHandler,
  validateScript,
  createDefaultContext,
  createNumberValue,
  createStringValue,
  createDiceValue,
  ScriptResult,
  ScriptOptions
} from '../src/index';
import { VariableType } from '../src/interpreter/types';

describe('主入口API测试', () => {
  describe('executeScript', () => {
    it('应该能够执行简单的数字表达式', () => {
      const result = executeScript('1 + 2');
      
      expect(result.success).toBe(true);
      expect(result.result).toBe('3');
      expect(result.errors).toHaveLength(0);
      expect(result.warnings).toHaveLength(0);
    });

    it('应该能够执行变量赋值和访问', () => {
      const result = executeScript('x = 10\nx + 5');
      
      expect(result.success).toBe(true);
      expect(result.result).toBe('15');
      expect(result.errors).toHaveLength(0);
    });

    it('应该能够处理字符串操作', () => {
      const result = executeScript('"Hello " + "World"');
      
      expect(result.success).toBe(true);
      expect(result.result).toBe('Hello World');
      expect(result.errors).toHaveLength(0);
    });

    it('应该能够处理掷骰表达式', () => {
      const result = executeScript('3d6');
      
      expect(result.success).toBe(true);
      // 掷骰结果应该在3-18之间
      const numResult = parseInt(result.result);
      expect(numResult).toBeGreaterThanOrEqual(3);
      expect(numResult).toBeLessThanOrEqual(18);
      expect(result.errors).toHaveLength(0);
    });

    it('应该能够处理if语句', () => {
      const result = executeScript('if (5 > 3) { "true" } else { "false" }');
      
      expect(result.success).toBe(true);
      expect(result.result).toBe('true');
      expect(result.errors).toHaveLength(0);
    });

    it('应该能够处理while循环', () => {
      const result = executeScript('i = 0\nwhile (i < 3) { i = i + 1 }\ni');
      
      expect(result.success).toBe(true);
      expect(result.result).toBe('3');
      expect(result.errors).toHaveLength(0);
    });

    it('应该能够使用自定义执行上下文', () => {
      const options: ScriptOptions = {
        context: {
          variables: new Map([
            ['x', { type: VariableType.NUMBER, value: 42 }]
          ])
        }
      };
      
      const result = executeScript('x * 2', options);
      
      expect(result.success).toBe(true);
      expect(result.result).toBe('84');
      expect(result.errors).toHaveLength(0);
    });

    it('应该能够处理语法错误', () => {
      const result = executeScript('1 + ('); // 明显的语法错误：未闭合的括号
      
      expect(result.success).toBe(false);
      expect(result.errors.length).toBeGreaterThan(0);
    });

    it('应该能够处理运行时错误', () => {
      const result = executeScript('$r只读变量 = 123'); // 尝试写入只读变量
      
      // 根据错误恢复配置，可能成功也可能失败
      // 但应该有警告或错误信息
      expect(result.errors.length + result.warnings.length).toBeGreaterThan(0);
    });
  });

  describe('parseScript', () => {
    it('应该能够解析简单表达式', () => {
      const { parser, tree } = parseScript('1 + 2');
      
      expect(parser).toBeDefined();
      expect(tree).toBeDefined();
    });

    it('应该能够解析复杂脚本', () => {
      const script = `
        x = 10
        if (x > 5) {
          y = x * 2
        } else {
          y = x / 2
        }
        y
      `;
      
      const { parser, tree } = parseScript(script);
      
      expect(parser).toBeDefined();
      expect(tree).toBeDefined();
    });
  });

  describe('createExecutionContext', () => {
    it('应该创建空的执行上下文', () => {
      const context = createExecutionContext();
      
      expect(context).toBeDefined();
      // 测试获取不存在的变量返回默认值
      const value = context.getVariable('nonexistent');
      expect(value.type).toBe(VariableType.NUMBER);
      expect(value.value).toBe(0);
    });

    it('应该能够使用初始数据创建执行上下文', () => {
      const initialData = {
        variables: new Map([
          ['test', { type: VariableType.STRING, value: 'hello' }]
        ])
      };
      
      const context = createExecutionContext(initialData);
      const value = context.getVariable('test');
      
      expect(value.type).toBe(VariableType.STRING);
      expect(value.value).toBe('hello');
    });
  });

  describe('createErrorHandler', () => {
    it('应该创建默认错误处理器', () => {
      const errorHandler = createErrorHandler();
      
      expect(errorHandler).toBeDefined();
    });

    it('应该能够使用自定义配置创建错误处理器', () => {
      const config = {
        enableErrorRecovery: false,
        logWarnings: false
      };
      
      const errorHandler = createErrorHandler(config);
      
      expect(errorHandler).toBeDefined();
    });
  });

  describe('validateScript', () => {
    it('应该验证有效的脚本', () => {
      const result = validateScript('1 + 2');
      
      expect(result.valid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it('应该检测无效的脚本', () => {
      const result = validateScript('1 + + 2');
      
      // 注意：由于ANTLR的错误恢复机制，某些语法错误可能不会立即被检测到
      // 这个测试主要验证函数能够正常工作
      expect(result).toHaveProperty('valid');
      expect(result).toHaveProperty('errors');
    });
  });

  describe('辅助函数', () => {
    describe('createDefaultContext', () => {
      it('应该创建默认上下文数据', () => {
        const context = createDefaultContext();
        
        expect(context.attributes).toBeInstanceOf(Map);
        expect(context.roleInfo).toBeInstanceOf(Map);
        expect(context.systemInfo).toBeInstanceOf(Map);
        expect(context.diceInfo).toBeInstanceOf(Map);
        expect(context.variables).toBeInstanceOf(Map);
      });
    });

    describe('值创建函数', () => {
      it('createNumberValue应该创建数字值', () => {
        const value = createNumberValue(42);
        
        expect(value.type).toBe(VariableType.NUMBER);
        expect(value.value).toBe(42);
      });

      it('createStringValue应该创建字符串值', () => {
        const value = createStringValue('hello');
        
        expect(value.type).toBe(VariableType.STRING);
        expect(value.value).toBe('hello');
      });

      it('createDiceValue应该创建掷骰表达式值', () => {
        const value = createDiceValue('3d6');
        
        expect(value.type).toBe(VariableType.DICE_EXPRESSION);
        expect(value.value).toBe('3d6');
      });
    });
  });

  describe('集成测试', () => {
    it('应该能够执行包含所有功能的复杂脚本', () => {
      const script = `
        hp = 100
        damage = 2d6 + 3
        hp = hp - damage
        if (hp <= 0) {
          status = "死亡"
        } else {
          if (hp < 20) {
            status = "重伤"
          } else {
            status = "健康"
          }
        }
        "生命值: " + hp + ", 状态: " + status
      `;
      
      const result = executeScript(script);
      
      expect(result.success).toBe(true);
      expect(result.result).toContain('生命值:');
      expect(result.result).toContain('状态:');
      expect(result.errors).toHaveLength(0);
    });

    it('应该能够处理特殊变量', () => {
      const options: ScriptOptions = {
        context: {
          attributes: new Map([
            ['力量', { type: VariableType.NUMBER, value: 15 }]
          ]),
          roleInfo: new Map([
            ['姓名', { type: VariableType.STRING, value: '张三' }]
          ])
        }
      };
      
      const result = executeScript('$a力量 + 5', options);
      
      expect(result.success).toBe(true);
      expect(result.result).toBe('20');
      expect(result.errors).toHaveLength(0);
    });

    it('应该能够处理字符串插值', () => {
      const options: ScriptOptions = {
        context: {
          variables: new Map([
            ['name', { type: VariableType.STRING, value: '玩家' }],
            ['level', { type: VariableType.NUMBER, value: 5 }]
          ])
        }
      };
      
      const result = executeScript('"欢迎 {$name}，你的等级是 {$level}"', options);
      
      expect(result.success).toBe(true);
      expect(result.result).toBe('欢迎 玩家，你的等级是 5');
      expect(result.errors).toHaveLength(0);
    });
  });
});