/**
 * 边界情况测试
 * 测试各种边界情况、异常输入和极限条件
 */

import { executeScript, createExecutionContext, createNumberValue, createStringValue } from '../src/index';
import { VariableType } from '../src/interpreter/types';

describe('边界情况测试', () => {
  describe('数值边界测试', () => {
    it('应该能够处理极大的数值', () => {
      const script = `
        big_num = 999999999
        result = big_num + 1
        result
      `;
      
      const result = executeScript(script);
      expect(result.success).toBe(true);
      expect(result.result).toBe('1000000000');
      expect(result.errors).toHaveLength(0);
    });

    it('应该能够处理极小的数值', () => {
      const script = `
        small_num = -999999999
        result = small_num - 1
        result
      `;
      
      const result = executeScript(script);
      expect(result.success).toBe(true);
      expect(result.result).toBe('-1000000000');
      expect(result.errors).toHaveLength(0);
    });

    it('应该能够处理浮点数精度问题', () => {
      const script = `
        a = 0.1
        b = 0.2
        c = a + b
        c
      `;
      
      const result = executeScript(script);
      expect(result.success).toBe(true);
      // 由于浮点数精度问题，结果可能不是精确的0.3
      const numResult = parseFloat(result.result);
      expect(numResult).toBeCloseTo(0.3, 10);
      expect(result.errors).toHaveLength(0);
    });

    it('应该能够处理零除法', () => {
      const script = `
        a = 10
        b = 0
        result = a / b
        result
      `;
      
      const result = executeScript(script);
      expect(result.success).toBe(true);
      expect(result.result).toBe('0'); // 根据实现，除零返回0
      expect(result.warnings.length).toBeGreaterThan(0);
    });

    it('应该能够处理模零运算', () => {
      const script = `
        a = 10
        b = 0
        result = a % b
        result
      `;
      
      const result = executeScript(script);
      expect(result.success).toBe(true);
      expect(result.result).toBe('0'); // 根据实现，模零返回0
      expect(result.warnings.length).toBeGreaterThan(0);
    });
  });

  describe('字符串边界测试', () => {
    it('应该能够处理空字符串', () => {
      const script = `
        empty = ""
        result = empty + "test"
        result
      `;
      
      const result = executeScript(script);
      expect(result.success).toBe(true);
      expect(result.result).toBe('test');
      expect(result.errors).toHaveLength(0);
    });

    it('应该能够处理非常长的字符串', () => {
      const longString = 'a'.repeat(1000);
      const script = `
        long_str = "${longString}"
        result = long_str + "end"
        result
      `;
      
      const result = executeScript(script);
      expect(result.success).toBe(true);
      expect(result.result).toBe(longString + 'end');
      expect(result.errors).toHaveLength(0);
    });

    it('应该能够处理包含特殊字符的字符串', () => {
      const script = `
        special = "Hello\\nWorld\\t!"
        result = special + " 测试"
        result
      `;
      
      const result = executeScript(script);
      expect(result.success).toBe(true);
      expect(result.result).toBe('Hello\nWorld\t! 测试');
      expect(result.errors).toHaveLength(0);
    });

    it('应该能够处理Unicode字符', () => {
      const script = `
        unicode = "🎲🎮🎯"
        result = unicode + " 游戏"
        result
      `;
      
      const result = executeScript(script);
      expect(result.success).toBe(true);
      expect(result.result).toBe('🎲🎮🎯 游戏');
      expect(result.errors).toHaveLength(0);
    });

    it('应该能够处理字符串中的引号', () => {
      const script = `
        quoted = "He said \\"Hello\\""
        result = quoted + " to me"
        result
      `;
      
      const result = executeScript(script);
      expect(result.success).toBe(true);
      expect(result.result).toBe('He said "Hello" to me');
      expect(result.errors).toHaveLength(0);
    });
  });

  describe('掷骰边界测试', () => {
    it('应该能够处理最小掷骰表达式', () => {
      const script = '1d1';
      
      const result = executeScript(script);
      expect(result.success).toBe(true);
      expect(result.result).toBe('1');
      expect(result.errors).toHaveLength(0);
    });

    it('应该能够处理大量骰子', () => {
      const script = '100d6';
      
      const result = executeScript(script);
      expect(result.success).toBe(true);
      const numResult = parseInt(result.result);
      expect(numResult).toBeGreaterThanOrEqual(100);
      expect(numResult).toBeLessThanOrEqual(600);
      expect(result.errors).toHaveLength(0);
    });

    it('应该能够处理大面数骰子', () => {
      const script = '1d100';
      
      const result = executeScript(script);
      expect(result.success).toBe(true);
      const numResult = parseInt(result.result);
      expect(numResult).toBeGreaterThanOrEqual(1);
      expect(numResult).toBeLessThanOrEqual(100);
      expect(result.errors).toHaveLength(0);
    });

    it('应该能够处理无效的掷骰表达式', () => {
      const script = `
        invalid1 = 0d6
        invalid2 = 1d0
        result = invalid1 + invalid2 + 10
        result
      `;
      
      const result = executeScript(script);
      expect(result.success).toBe(true);
      expect(result.result).toBe('10'); // 无效掷骰返回0
      expect(result.warnings.length).toBeGreaterThan(0);
    });
  });

  describe('变量边界测试', () => {
    it('应该能够处理大量变量', () => {
      let script = '';
      for (let i = 1; i <= 100; i++) {
        script += `var${i} = ${i}\n`;
      }
      script += 'var1 + var50 + var100';
      
      const result = executeScript(script);
      expect(result.success).toBe(true);
      expect(result.result).toBe('151'); // 1 + 50 + 100 = 151
      expect(result.errors).toHaveLength(0);
    });

    it('应该能够处理非常长的变量名', () => {
      const longVarName = 'very_long_variable_name_that_exceeds_normal_length_limits_but_should_still_work';
      const script = `
        ${longVarName} = 42
        result = ${longVarName} * 2
        result
      `;
      
      const result = executeScript(script);
      expect(result.success).toBe(true);
      expect(result.result).toBe('84');
      expect(result.errors).toHaveLength(0);
    });

    it('应该能够处理中文变量名', () => {
      const script = `
        中文变量 = 100
        另一个变量 = 200
        结果 = 中文变量 + 另一个变量
        结果
      `;
      
      const result = executeScript(script);
      expect(result.success).toBe(true);
      expect(result.result).toBe('300');
      expect(result.errors).toHaveLength(0);
    });

    it('应该能够处理未定义变量的访问', () => {
      const script = `
        defined = 10
        result = defined + undefined_var + another_undefined
        result
      `;
      
      const result = executeScript(script);
      expect(result.success).toBe(true);
      expect(result.result).toBe('10'); // 10 + 0 + 0 = 10
      expect(result.errors).toHaveLength(0);
    });
  });

  describe('特殊变量边界测试', () => {
    it('应该能够处理大量特殊变量', () => {
      const attributes = new Map();
      const diceInfo = new Map();
      
      // 添加大量特殊变量
      for (let i = 1; i <= 50; i++) {
        attributes.set(`属性${i}`, createNumberValue(i));
        diceInfo.set(`数据${i}`, createNumberValue(i * 2));
      }

      const script = `
        sum1 = $a属性1 + $a属性25 + $a属性50
        sum2 = $d数据1 + $d数据25 + $d数据50
        sum1 + sum2
      `;
      
      const result = executeScript(script, { 
        context: { attributes, diceInfo }
      });
      expect(result.success).toBe(true);
      expect(result.result).toBe('228'); // (1+25+50) + (2+50+100) = 76 + 152 = 228
      expect(result.errors).toHaveLength(0);
    });

    it('应该能够处理特殊变量名中的特殊字符', () => {
      const attributes = new Map([
        ['力量_加成', createNumberValue(10)],
        ['敏捷-修正', createNumberValue(5)]
      ]);

      const script = `
        total = $a力量_加成 + $a敏捷-修正
        total
      `;
      
      const result = executeScript(script, { 
        context: { attributes }
      });
      expect(result.success).toBe(true);
      expect(result.result).toBe('15');
      expect(result.errors).toHaveLength(0);
    });

    it('应该能够处理只读特殊变量的写入尝试', () => {
      const roleInfo = new Map([
        ['姓名', createStringValue('原名')]
      ]);

      const script = `
        original = $r姓名
        $r姓名 = "新名"
        current = $r姓名
        original + " -> " + current
      `;
      
      const result = executeScript(script, { 
        context: { roleInfo }
      });
      expect(result.result).toBe('原名 -> 原名'); // 写入失败，保持原值
      expect(result.errors.length).toBeGreaterThan(0);
    });
  });

  describe('表达式边界测试', () => {
    it('应该能够处理极深的嵌套表达式', () => {
      let script = '1';
      for (let i = 0; i < 20; i++) {
        script = `(${script} + 1)`;
      }
      
      const result = executeScript(script);
      expect(result.success).toBe(true);
      expect(result.result).toBe('21'); // 1 + 20个1 = 21
      expect(result.errors).toHaveLength(0);
    });

    it('应该能够处理复杂的运算符优先级', () => {
      const script = `
        result = 1 + 2 * 3 - 4 / 2 + 5 % 3 > 6 && 7 < 8 || 9 == 9 ? 10 : 11
        result
      `;
      
      const result = executeScript(script);
      expect(result.success).toBe(true);
      // 1 + 6 - 2 + 2 = 7, 7 > 6 = true, true && true = true, true || true = true, true ? 10 : 11 = 10
      expect(result.result).toBe('10');
      expect(result.errors).toHaveLength(0);
    });

    it('应该能够处理混合类型的复杂表达式', () => {
      const script = `
        num = 42
        str = "test"
        dice = 1d1
        bool_result = num > 40 && str != "" && dice == 1
        final = bool_result ? num + " " + str : "failed"
        final
      `;
      
      const result = executeScript(script);
      expect(result.success).toBe(true);
      expect(result.result).toBe('42 test');
      expect(result.errors).toHaveLength(0);
    });
  });

  describe('控制流边界测试', () => {
    it('应该能够处理深度嵌套的if语句', () => {
      const script = `
        x = 5
        result = ""
        if (x > 0) {
          if (x > 2) {
            if (x > 4) {
              if (x > 6) {
                result = "very big"
              } else {
                result = "big"
              }
            } else {
              result = "medium"
            }
          } else {
            result = "small"
          }
        } else {
          result = "zero or negative"
        }
        result
      `;
      
      const result = executeScript(script);
      expect(result.success).toBe(true);
      expect(result.result).toBe('big');
      expect(result.errors).toHaveLength(0);
    });

    it('应该能够处理while循环的边界条件', () => {
      const script = `
        i = 0
        count = 0
        while (i < 0) {
          count += 1
          i += 1
        }
        count
      `;
      
      const result = executeScript(script);
      expect(result.success).toBe(true);
      expect(result.result).toBe('0'); // 循环不执行
      expect(result.errors).toHaveLength(0);
    });

    it('应该能够处理循环中的break条件模拟', () => {
      const script = `
        i = 0
        sum = 0
        found = 0
        while (i < 100 && found == 0) {
          sum += i
          if (sum > 50) {
            found = 1
          }
          i += 1
        }
        "i: " + i + ", sum: " + sum
      `;
      
      const result = executeScript(script);
      expect(result.success).toBe(true);
      expect(result.result).toContain('i: ');
      expect(result.result).toContain('sum: ');
      expect(result.errors).toHaveLength(0);
    });
  });

  describe('字符串插值边界测试', () => {
    it('应该能够处理空的插值表达式', () => {
      const script = `
        result = "test {$} end"
        result
      `;
      
      const result = executeScript(script);
      expect(result.success).toBe(true);
      expect(result.result).toBe('test  end'); // 空插值应该被替换为空字符串
      expect(result.errors).toHaveLength(0);
    });

    it('应该能够处理大量插值表达式', () => {
      const variables = new Map();
      for (let i = 1; i <= 20; i++) {
        variables.set(`var${i}`, createNumberValue(i));
      }

      let script = '"Values: ';
      for (let i = 1; i <= 20; i++) {
        script += `{$var${i}} `;
      }
      script += '"';
      
      const result = executeScript(script, { 
        context: { variables }
      });
      expect(result.success).toBe(true);
      expect(result.result).toContain('Values: 1 2 3');
      expect(result.result).toContain('18 19 20 ');
      expect(result.errors).toHaveLength(0);
    });

    it('应该能够处理嵌套的插值表达式', () => {
      const variables = new Map([
        ['x', createNumberValue(5)],
        ['y', createNumberValue(10)]
      ]);

      const script = `
        template = "x={$x}, y={$y}, sum={$x}+{$y}"
        template
      `;
      
      const result = executeScript(script, { 
        context: { variables }
      });
      expect(result.success).toBe(true);
      expect(result.result).toBe('x=5, y=10, sum=5+10');
      expect(result.errors).toHaveLength(0);
    });

    it('应该能够处理插值中的未定义变量', () => {
      const script = `
        template = "defined: {$defined}, undefined: {$undefined}"
        template
      `;
      
      const result = executeScript(script);
      expect(result.success).toBe(true);
      expect(result.result).toBe('defined: 0, undefined: 0');
      expect(result.errors).toHaveLength(0);
    });
  });

  describe('类型转换边界测试', () => {
    it('应该能够处理极端的类型转换', () => {
      const script = `
        str_num = "123.456"
        str_invalid = "abc123"
        num_result1 = str_num * 2
        num_result2 = str_invalid * 2
        "valid: " + num_result1 + ", invalid: " + num_result2
      `;
      
      const result = executeScript(script);
      expect(result.success).toBe(true);
      expect(result.result).toBe('valid: 246.912, invalid: 0');
      expect(result.errors).toHaveLength(0);
    });

    it('应该能够处理布尔值转换的边界情况', () => {
      const script = `
        zero = 0
        empty_str = ""
        non_zero = 42
        non_empty = "test"
        result1 = zero ? "true" : "false"
        result2 = empty_str ? "true" : "false"
        result3 = non_zero ? "true" : "false"
        result4 = non_empty ? "true" : "false"
        result1 + "," + result2 + "," + result3 + "," + result4
      `;
      
      const result = executeScript(script);
      expect(result.success).toBe(true);
      expect(result.result).toBe('false,false,true,true');
      expect(result.errors).toHaveLength(0);
    });
  });

  describe('错误恢复边界测试', () => {
    it('应该能够从多个错误中恢复', () => {
      const script = `
        valid1 = 10
        invalid_dice = 0d6
        division_by_zero = 10 / 0
        valid2 = 20
        result = valid1 + invalid_dice + division_by_zero + valid2
        result
      `;
      
      const result = executeScript(script);
      expect(result.success).toBe(true);
      expect(result.result).toBe('30'); // 10 + 0 + 0 + 20 = 30
      expect(result.warnings.length).toBeGreaterThan(0);
    });

    it('应该能够处理连续的只读变量写入尝试', () => {
      const roleInfo = new Map([
        ['name', createStringValue('original')]
      ]);
      const systemInfo = new Map([
        ['version', createStringValue('1.0')]
      ]);

      const script = `
        $rname = "new name"
        $sversion = "2.0"
        result = $rname + " " + $sversion
        result
      `;
      
      const result = executeScript(script, { 
        context: { roleInfo, systemInfo }
      });
      expect(result.result).toBe('original 1.0');
      expect(result.errors.length).toBeGreaterThan(0);
    });
  });
});