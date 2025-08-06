/**
 * 基本的设置验证测试
 */

import { VariableType, SpecialVariablePrefix } from '../src/interpreter/types';

describe('项目环境配置验证', () => {
  test('类型定义应该正确导出', () => {
    expect(VariableType.NUMBER).toBe('NUMBER');
    expect(VariableType.STRING).toBe('STRING');
    expect(VariableType.DICE_EXPRESSION).toBe('DICE_EXPRESSION');
  });

  test('特殊变量前缀应该正确定义', () => {
    expect(SpecialVariablePrefix.ATTRIBUTE).toBe('a');
    expect(SpecialVariablePrefix.ROLE).toBe('r');
    expect(SpecialVariablePrefix.SYSTEM).toBe('s');
    expect(SpecialVariablePrefix.DICE).toBe('d');
  });

  test('ANTLR4生成的文件应该可以导入', async () => {
    // 动态导入以避免编译时错误
    const { DicenicLexer } = await import('../src/generated/DicenicLexer');
    const { DicenicParser } = await import('../src/generated/DicenicParser');

    expect(DicenicLexer).toBeDefined();
    expect(DicenicParser).toBeDefined();
  });
});