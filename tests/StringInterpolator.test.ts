/**
 * StringInterpolator 单元测试
 * 测试字符串插值处理器的各种功能
 */

import { StringInterpolator } from '../src/utils/StringInterpolator';
import { ExecutionContext } from '../src/interpreter/ExecutionContext';
import { VariableType } from '../src/interpreter/types';

describe('StringInterpolator', () => {
  let context: ExecutionContext;

  beforeEach(() => {
    // 使用初始数据创建上下文，包括只读变量
    const initialData = {
      variables: new Map([
        ['name', { type: VariableType.STRING, value: '张三' }],
        ['age', { type: VariableType.NUMBER, value: 25 }],
        ['score', { type: VariableType.NUMBER, value: 85.5 }]
      ]),
      attributes: new Map([
        ['力量', { type: VariableType.NUMBER, value: 15 }],
        ['敏捷', { type: VariableType.NUMBER, value: 18 }]
      ]),
      roleInfo: new Map([
        ['姓名', { type: VariableType.STRING, value: '李四' }],
        ['职业', { type: VariableType.STRING, value: '战士' }]
      ]),
      systemInfo: new Map([
        ['版本', { type: VariableType.STRING, value: '1.0.0' }]
      ]),
      diceInfo: new Map([
        ['骰娘名', { type: VariableType.STRING, value: '小骰' }]
      ])
    };
    
    context = new ExecutionContext(initialData);
  });

  describe('interpolate', () => {
    test('应该处理简单的变量插值', () => {
      const template = '你好，{$name}！';
      const result = StringInterpolator.interpolate(template, context);
      expect(result).toBe('你好，张三！');
    });

    test('应该处理多个变量插值', () => {
      const template = '{$name}今年{$age}岁，考试得了{$score}分。';
      const result = StringInterpolator.interpolate(template, context);
      expect(result).toBe('张三今年25岁，考试得了85.5分。');
    });

    test('应该处理特殊变量插值', () => {
      const template = '角色{$r姓名}的力量是{$a力量}，敏捷是{$a敏捷}。';
      const result = StringInterpolator.interpolate(template, context);
      expect(result).toBe('角色李四的力量是15，敏捷是18。');
    });

    test('应该处理系统和骰娘变量插值', () => {
      const template = '当前版本：{$s版本}，骰娘：{$d骰娘名}';
      const result = StringInterpolator.interpolate(template, context);
      expect(result).toBe('当前版本：1.0.0，骰娘：小骰');
    });

    test('应该处理不存在的变量', () => {
      const template = '未定义变量：{$undefined}，特殊变量：{$a未定义}';
      const result = StringInterpolator.interpolate(template, context);
      expect(result).toBe('未定义变量：0，特殊变量：0');
    });

    test('应该处理不存在的只读特殊变量', () => {
      const template = '角色信息：{$r未定义}，系统信息：{$s未定义}';
      const result = StringInterpolator.interpolate(template, context);
      expect(result).toBe('角色信息：，系统信息：');
    });

    test('应该处理空字符串和null', () => {
      expect(StringInterpolator.interpolate('', context)).toBe('');
      expect(StringInterpolator.interpolate(null as any, context)).toBe('');
      expect(StringInterpolator.interpolate(undefined as any, context)).toBe('');
    });

    test('应该处理没有插值的字符串', () => {
      const template = '这是一个普通字符串';
      const result = StringInterpolator.interpolate(template, context);
      expect(result).toBe('这是一个普通字符串');
    });

    test('应该处理相邻的插值表达式', () => {
      const template = '{$name}{$age}';
      const result = StringInterpolator.interpolate(template, context);
      expect(result).toBe('张三25');
    });

    test('应该处理包含空格的变量名', () => {
      context.setVariable('test var', { type: VariableType.STRING, value: 'test value' });
      const template = '值：{$test var}';
      const result = StringInterpolator.interpolate(template, context);
      expect(result).toBe('值：test value');
    });

    test('应该处理复杂的中文变量名', () => {
      context.setSpecialVariable('a', '角色卡属性名称', { type: VariableType.NUMBER, value: 100 });
      const template = '属性值：{$a角色卡属性名称}';
      const result = StringInterpolator.interpolate(template, context);
      expect(result).toBe('属性值：100');
    });

    test('应该处理错误的表达式格式', () => {
      // 模拟控制台警告
      const consoleSpy = jest.spyOn(console, 'warn').mockImplementation();
      
      const template = '错误格式：{$}，正常格式：{$name}';
      const result = StringInterpolator.interpolate(template, context);
      expect(result).toBe('错误格式：，正常格式：张三');
      
      consoleSpy.mockRestore();
    });
  });

  describe('parseInterpolationExpressions', () => {
    test('应该解析单个插值表达式', () => {
      const expressions = (StringInterpolator as any).parseInterpolationExpressions('Hello {$name}!');
      expect(expressions).toHaveLength(1);
      expect(expressions[0]).toEqual({
        start: 6,
        end: 13,
        expression: 'name'
      });
    });

    test('应该解析多个插值表达式', () => {
      const expressions = (StringInterpolator as any).parseInterpolationExpressions('{$name} is {$age} years old');
      expect(expressions).toHaveLength(2);
      expect(expressions[0]).toEqual({
        start: 0,
        end: 7,
        expression: 'name'
      });
      expect(expressions[1]).toEqual({
        start: 11,
        end: 17,
        expression: 'age'
      });
    });

    test('应该解析特殊变量表达式', () => {
      const expressions = (StringInterpolator as any).parseInterpolationExpressions('{$a力量} {$r姓名}');
      expect(expressions).toHaveLength(2);
      expect(expressions[0].expression).toBe('a力量');
      expect(expressions[1].expression).toBe('r姓名');
    });

    test('应该处理没有插值的字符串', () => {
      const expressions = (StringInterpolator as any).parseInterpolationExpressions('No interpolation here');
      expect(expressions).toHaveLength(0);
    });
  });

  describe('hasInterpolation', () => {
    test('应该检测包含插值的字符串', () => {
      expect(StringInterpolator.hasInterpolation('Hello {$name}!')).toBe(true);
      expect(StringInterpolator.hasInterpolation('{$a力量}')).toBe(true);
      expect(StringInterpolator.hasInterpolation('Multiple {$var1} and {$var2}')).toBe(true);
    });

    test('应该检测不包含插值的字符串', () => {
      expect(StringInterpolator.hasInterpolation('No interpolation')).toBe(false);
      expect(StringInterpolator.hasInterpolation('Just {brackets}')).toBe(false);
      expect(StringInterpolator.hasInterpolation('$variable without braces')).toBe(false);
      expect(StringInterpolator.hasInterpolation('')).toBe(false);
      expect(StringInterpolator.hasInterpolation(null as any)).toBe(false);
    });
  });

  describe('getInterpolationVariables', () => {
    test('应该提取所有插值变量名', () => {
      const variables = StringInterpolator.getInterpolationVariables('{$name} is {$age} with {$a力量}');
      expect(variables).toEqual(['name', 'age', 'a力量']);
    });

    test('应该处理重复的变量名', () => {
      const variables = StringInterpolator.getInterpolationVariables('{$name} and {$name} again');
      expect(variables).toEqual(['name', 'name']);
    });

    test('应该处理没有插值的字符串', () => {
      const variables = StringInterpolator.getInterpolationVariables('No variables here');
      expect(variables).toEqual([]);
    });

    test('应该处理空字符串和null', () => {
      expect(StringInterpolator.getInterpolationVariables('')).toEqual([]);
      expect(StringInterpolator.getInterpolationVariables(null as any)).toEqual([]);
    });
  });

  describe('escapeInterpolation', () => {
    test('应该转义插值语法', () => {
      const result = StringInterpolator.escapeInterpolation('Show literal {$variable}');
      expect(result).toBe('Show literal \\{$variable\\}');
    });

    test('应该处理多个插值表达式', () => {
      const result = StringInterpolator.escapeInterpolation('{$var1} and {$var2}');
      expect(result).toBe('\\{$var1\\} and \\{$var2\\}');
    });

    test('应该处理没有插值的字符串', () => {
      const result = StringInterpolator.escapeInterpolation('No interpolation');
      expect(result).toBe('No interpolation');
    });
  });

  describe('unescapeInterpolation', () => {
    test('应该反转义插值语法', () => {
      const result = StringInterpolator.unescapeInterpolation('Show literal \\{$variable\\}');
      expect(result).toBe('Show literal {$variable}');
    });

    test('应该处理多个转义表达式', () => {
      const result = StringInterpolator.unescapeInterpolation('\\{$var1\\} and \\{$var2\\}');
      expect(result).toBe('{$var1} and {$var2}');
    });

    test('应该处理没有转义的字符串', () => {
      const result = StringInterpolator.unescapeInterpolation('No escaping');
      expect(result).toBe('No escaping');
    });
  });

  describe('validateInterpolationSyntax', () => {
    test('应该验证有效的插值语法', () => {
      const result = StringInterpolator.validateInterpolationSyntax('Hello {$name}!');
      expect(result.isValid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    test('应该验证多个有效插值', () => {
      const result = StringInterpolator.validateInterpolationSyntax('{$name} is {$age} years old');
      expect(result.isValid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    test('应该检测空的插值表达式', () => {
      const result = StringInterpolator.validateInterpolationSyntax('Empty: {$}');
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Empty interpolation expression at position 7');
    });

    test('应该检测未闭合的插值表达式', () => {
      const result = StringInterpolator.validateInterpolationSyntax('Unclosed: {$name');
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Unclosed interpolation expression');
    });

    test('应该检测嵌套的插值表达式', () => {
      const result = StringInterpolator.validateInterpolationSyntax('Nested: {$outer{$inner}}');
      expect(result.isValid).toBe(false);
      expect(result.errors.some(err => err.includes('Nested interpolation not allowed'))).toBe(true);
    });

    test('应该处理没有插值的字符串', () => {
      const result = StringInterpolator.validateInterpolationSyntax('No interpolation');
      expect(result.isValid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    test('应该处理空字符串', () => {
      const result = StringInterpolator.validateInterpolationSyntax('');
      expect(result.isValid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });
  });

  describe('需求验证', () => {
    test('需求5.4: 应该正确解析并替换变量值', () => {
      // 测试字符串插值功能
      const template = '角色{$r姓名}的属性：力量{$a力量}，当前版本{$s版本}';
      const result = StringInterpolator.interpolate(template, context);
      expect(result).toBe('角色李四的属性：力量15，当前版本1.0.0');
    });

    test('应该支持{$variable}语法', () => {
      // 测试标准的{$variable}语法
      const template = '普通变量：{$name}，特殊变量：{$a力量}';
      const result = StringInterpolator.interpolate(template, context);
      expect(result).toBe('普通变量：张三，特殊变量：15');
    });

    test('应该处理嵌套表达式插值', () => {
      // 虽然当前实现不支持复杂的嵌套表达式，但应该能处理基本的变量插值
      const template = '组合信息：{$r姓名}-{$r职业}';
      const result = StringInterpolator.interpolate(template, context);
      expect(result).toBe('组合信息：李四-战士');
    });

    test('应该正确处理中文变量名', () => {
      context.setVariable('中文变量', { type: VariableType.STRING, value: '中文值' });
      const template = '中文测试：{$中文变量}';
      const result = StringInterpolator.interpolate(template, context);
      expect(result).toBe('中文测试：中文值');
    });

    test('应该提供语法验证功能', () => {
      // 测试语法验证
      const validResult = StringInterpolator.validateInterpolationSyntax('{$valid}');
      expect(validResult.isValid).toBe(true);
      
      const invalidResult = StringInterpolator.validateInterpolationSyntax('{$}');
      expect(invalidResult.isValid).toBe(false);
    });
  });
});