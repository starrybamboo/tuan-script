/**
 * 综合集成测试
 * 测试各种语法结构的组合使用、错误处理和边界情况
 */

import { executeScript, createExecutionContext, createNumberValue, createStringValue } from '../src/index';
import { VariableType } from '../src/interpreter/types';

describe('综合集成测试', () => {
  describe('复杂语法结构组合', () => {
    it('应该能够处理嵌套的if-else和while循环', () => {
      const script = `
        result = 0
        i = 1
        while (i <= 3) {
          if (i % 2 == 0) {
            result = result + i * 2
          } else {
            result = result + i
          }
          i = i + 1
        }
        result
      `;
      
      const result = executeScript(script);
      expect(result.success).toBe(true);
      // 计算过程：i=1(奇数): result=0+1=1, i=2(偶数): result=1+4=5, i=3(奇数): result=5+3=8
      expect(result.result).toBe('8');
      expect(result.errors).toHaveLength(0);
    });

    it('应该能够处理三元运算符与赋值的组合', () => {
      const script = `
        x = 10
        y = 5
        max = x > y ? x : y
        min = x < y ? x : y
        "最大值: " + max + ", 最小值: " + min
      `;
      
      const result = executeScript(script);
      expect(result.success).toBe(true);
      expect(result.result).toBe('最大值: 10, 最小值: 5');
      expect(result.errors).toHaveLength(0);
    });

    it('应该能够处理复杂的逻辑表达式', () => {
      const script = `
        a = 5
        b = 10
        c = 15
        result = (a > 0 && b < 20) || (c == 15 && a + b > 10)
        result ? "条件满足" : "条件不满足"
      `;
      
      const result = executeScript(script);
      expect(result.success).toBe(true);
      expect(result.result).toBe('条件满足');
      expect(result.errors).toHaveLength(0);
    });

    it('应该能够处理掷骰表达式与算术运算的组合', () => {
      const script = `
        base = 10
        bonus = 2d6
        total = base + bonus
        result = total > 15 ? "成功" : "失败"
        result
      `;
      
      const result = executeScript(script);
      expect(result.success).toBe(true);
      expect(['成功', '失败']).toContain(result.result);
      expect(result.errors).toHaveLength(0);
    });

    it('应该能够处理字符串插值与控制流的组合', () => {
      const options = {
        context: {
          variables: new Map([
            ['name', createStringValue('测试角色')],
            ['level', createNumberValue(5)]
          ])
        }
      };

      const script = `
        hp = level * 10
        status = hp > 30 ? "健康" : "虚弱"
        "角色 {$name} (等级 {$level}) 生命值: " + hp + ", 状态: " + status
      `;
      
      const result = executeScript(script, options);
      expect(result.success).toBe(true);
      expect(result.result).toBe('角色 测试角色 (等级 5) 生命值: 50, 状态: 健康');
      expect(result.errors).toHaveLength(0);
    });
  });

  describe('特殊变量综合测试', () => {
    it('应该能够在复杂表达式中使用各种特殊变量', () => {
      const options = {
        context: {
          attributes: new Map([
            ['力量', createNumberValue(15)],
            ['敏捷', createNumberValue(12)]
          ]),
          roleInfo: new Map([
            ['姓名', createStringValue('张三')],
            ['职业', createStringValue('战士')]
          ]),
          systemInfo: new Map([
            ['版本', createStringValue('1.0')],
            ['模式', createStringValue('标准')]
          ]),
          diceInfo: new Map([
            ['骰子数', createNumberValue(6)]
          ])
        }
      };

      const script = `
        combat_bonus = $a力量 + $a敏捷
        dice_result = 1d6
        final_result = combat_bonus + dice_result
        "{$r姓名}({$r职业}) 在{$s模式}模式下的战斗检定: " + final_result
      `;
      
      const result = executeScript(script, options);
      expect(result.success).toBe(true);
      expect(result.result).toContain('张三(战士) 在标准模式下的战斗检定:');
      expect(result.errors).toHaveLength(0);
    });

    it('应该能够处理特殊变量的复合赋值', () => {
      const options = {
        context: {
          attributes: new Map([
            ['经验', createNumberValue(100)]
          ]),
          diceInfo: new Map([
            ['计数器', createNumberValue(0)]
          ])
        }
      };

      const script = `
        $a经验 += 50
        $d计数器 += 1
        i = 0
        while (i < 3) {
          $d计数器 += 1
          i = i + 1
        }
        "经验: " + $a经验 + ", 计数器: " + $d计数器
      `;
      
      const result = executeScript(script, options);
      expect(result.success).toBe(true);
      expect(result.result).toBe('经验: 150, 计数器: 4');
      expect(result.errors).toHaveLength(0);
    });
  });

  describe('边界情况和错误处理', () => {
    it('应该能够处理大量嵌套的表达式', () => {
      const script = `
        result = ((((1 + 2) * 3) - 4) / 2) + (5 > 3 ? 10 : 0)
        result
      `;
      
      const result = executeScript(script);
      expect(result.success).toBe(true);
      // ((((1+2)*3)-4)/2) + 10 = ((9-4)/2) + 10 = 2.5 + 10 = 12.5
      expect(result.result).toBe('12.5');
      expect(result.errors).toHaveLength(0);
    });

    it('应该能够处理空字符串和零值的边界情况', () => {
      const script = `
        empty_str = ""
        zero_val = 0
        result1 = empty_str ? "非空" : "空"
        result2 = zero_val ? "非零" : "零"
        result1 + ", " + result2
      `;
      
      const result = executeScript(script);
      expect(result.success).toBe(true);
      expect(result.result).toBe('空, 零');
      expect(result.errors).toHaveLength(0);
    });

    it('应该能够处理未定义变量的默认值', () => {
      const script = `
        undefined_num = undefined_var
        undefined_str = undefined_var + ""
        "数字: " + undefined_num + ", 字符串: " + undefined_str
      `;
      
      const result = executeScript(script);
      expect(result.success).toBe(true);
      expect(result.result).toBe('数字: 0, 字符串: 0');
      expect(result.errors).toHaveLength(0);
    });

    it('应该能够处理循环中的复杂逻辑', () => {
      const script = `
        sum = 0
        product = 1
        i = 1
        while (i <= 5) {
          if (i % 2 == 0) {
            sum += i
          } else {
            product *= i
          }
          i += 1
        }
        "和: " + sum + ", 积: " + product
      `;
      
      const result = executeScript(script);
      expect(result.success).toBe(true);
      // 偶数和: 2+4 = 6, 奇数积: 1*1*3*5 = 15
      expect(result.result).toBe('和: 6, 积: 15');
      expect(result.errors).toHaveLength(0);
    });

    it('应该能够处理字符串和数字的混合运算', () => {
      const script = `
        str_num = "123"
        num = 456
        result1 = str_num + num
        result2 = str_num * 2
        "连接: " + result1 + ", 运算: " + result2
      `;
      
      const result = executeScript(script);
      expect(result.success).toBe(true);
      // 字符串"123"与数字456相加，会转换为数字运算：123+456=579
      expect(result.result).toBe('连接: 579, 运算: 246');
      expect(result.errors).toHaveLength(0);
    });
  });

  describe('性能和内存测试', () => {
    it('应该能够处理中等规模的循环', () => {
      const script = `
        sum = 0
        i = 1
        while (i <= 100) {
          sum += i
          i += 1
        }
        sum
      `;
      
      const startTime = Date.now();
      const result = executeScript(script);
      const endTime = Date.now();
      
      expect(result.success).toBe(true);
      expect(result.result).toBe('5050'); // 1+2+...+100 = 5050
      expect(result.errors).toHaveLength(0);
      expect(endTime - startTime).toBeLessThan(1000); // 应该在1秒内完成
    });

    it('应该能够处理大量变量赋值', () => {
      let script = '';
      for (let i = 1; i <= 50; i++) {
        script += `var${i} = ${i}\n`;
      }
      script += 'var1 + var25 + var50';
      
      const startTime = Date.now();
      const result = executeScript(script);
      const endTime = Date.now();
      
      expect(result.success).toBe(true);
      expect(result.result).toBe('76'); // 1 + 25 + 50 = 76
      expect(result.errors).toHaveLength(0);
      expect(endTime - startTime).toBeLessThan(1000);
    });

    it('应该能够处理深度嵌套的三元运算符', () => {
      const script = `
        x = 10
        result = x > 15 ? "很大" : 
                 x > 10 ? "大" : 
                 x > 5 ? "中等" : 
                 x > 0 ? "小" : "零或负数"
        result
      `;
      
      const result = executeScript(script);
      expect(result.success).toBe(true);
      expect(result.result).toBe('中等');
      expect(result.errors).toHaveLength(0);
    });
  });

  describe('实际使用场景模拟', () => {
    it('应该能够模拟角色扮演游戏的属性检定', () => {
      const options = {
        context: {
          attributes: new Map([
            ['力量', createNumberValue(16)],
            ['敏捷', createNumberValue(14)],
            ['智力', createNumberValue(12)]
          ]),
          roleInfo: new Map([
            ['姓名', createStringValue('艾莉亚')],
            ['等级', createNumberValue(3)]
          ])
        }
      };

      const script = `
        difficulty = 15
        attribute_bonus = $a力量
        level_bonus = $r等级
        dice_roll = 1d1
        total = dice_roll + attribute_bonus + level_bonus
        success = total >= difficulty
        result_text = success ? "成功" : "失败"
        name = $r姓名
        name + " 的力量检定 (难度 " + difficulty + "): " + total + " - " + result_text
      `;
      
      const result = executeScript(script);
      expect(result.success).toBe(true);
      expect(result.result).toBe('艾莉亚 的力量检定 (难度 15): 20 - 成功');
      expect(result.errors).toHaveLength(0);
    });

    it('应该能够模拟战斗伤害计算', () => {
      const options = {
        context: {
          attributes: new Map([
            ['攻击力', createNumberValue(8)],
            ['暴击率', createNumberValue(20)]
          ])
        }
      };

      const script = `
        base_damage = $a攻击力
        weapon_damage = 2d6
        crit_roll = 1d100
        is_crit = crit_roll <= $a暴击率
        damage = base_damage + weapon_damage
        final_damage = is_crit ? damage * 2 : damage
        crit_text = is_crit ? " (暴击!)" : ""
        "造成伤害: " + final_damage + crit_text
      `;
      
      const result = executeScript(script);
      expect(result.success).toBe(true);
      expect(result.result).toContain('造成伤害:');
      expect(result.errors).toHaveLength(0);
    });

    it('应该能够模拟商店价格计算', () => {
      const options = {
        context: {
          systemInfo: new Map([
            ['折扣率', createNumberValue(10)],
            ['税率', createNumberValue(5)]
          ])
        }
      };

      const script = `
        base_price = 100
        discount_rate = $s折扣率
        tax_rate = $s税率
        discounted_price = base_price - base_price * discount_rate / 100
        final_price = discounted_price + discounted_price * tax_rate / 100
        "原价: " + base_price + ", 折后价: " + discounted_price + ", 含税价: " + final_price
      `;
      
      const result = executeScript(script);
      expect(result.success).toBe(true);
      expect(result.result).toBe('原价: 100, 折后价: 90, 含税价: 94.5');
      expect(result.errors).toHaveLength(0);
    });

    it('应该能够模拟条件分支的复杂逻辑', () => {
      const options = {
        context: {
          attributes: new Map([
            ['生命值', createNumberValue(25)],
            ['魔法值', createNumberValue(15)]
          ])
        }
      };

      const script = `
        hp = $a生命值
        mp = $a魔法值
        
        if (hp <= 0) {
          status = "死亡"
        } else {
          if (hp < 20) {
            status = "重伤"
          } else {
            if (hp < 50) {
              status = "轻伤"
            } else {
              status = "健康"
            }
          }
        }
        
        if (mp > 20) {
          magic_status = "魔力充沛"
        } else {
          if (mp > 10) {
            magic_status = "魔力一般"
          } else {
            magic_status = "魔力不足"
          }
        }
        
        "生命状态: " + status + ", 魔法状态: " + magic_status
      `;
      
      const result = executeScript(script);
      expect(result.success).toBe(true);
      expect(result.result).toBe('生命状态: 轻伤, 魔法状态: 魔力一般');
      expect(result.errors).toHaveLength(0);
    });
  });

  describe('错误恢复和容错性测试', () => {
    it('应该能够在遇到无效掷骰表达式时继续执行', () => {
      const script = `
        valid_roll = 2d6
        invalid_roll = 0d6
        result = valid_roll + invalid_roll + 10
        "结果: " + result
      `;
      
      const result = executeScript(script);
      expect(result.success).toBe(true);
      expect(result.warnings.length).toBeGreaterThan(0);
      // 无效掷骰应该返回0，所以结果应该是 valid_roll + 0 + 10
      const numResult = parseInt(result.result.split(': ')[1]);
      expect(numResult).toBeGreaterThanOrEqual(12); // 2d6最小值2 + 0 + 10
      expect(numResult).toBeLessThanOrEqual(22); // 2d6最大值12 + 0 + 10
    });

    it('应该能够处理只读变量写入尝试并继续执行', () => {
      const options = {
        context: {
          roleInfo: new Map([
            ['姓名', createStringValue('测试角色')]
          ])
        }
      };

      const script = `
        original_name = $r姓名
        $r姓名 = "新名字"
        current_name = $r姓名
        "原名: " + original_name + ", 当前名: " + current_name
      `;
      
      const result = executeScript(script, options);
      // 由于错误恢复机制，脚本会继续执行，但会有错误记录
      // 只读变量写入失败，但读取应该正常工作
      expect(result.result).toBe('原名: 测试角色, 当前名: 测试角色');
      expect(result.errors.length).toBeGreaterThan(0);
    });

    it('应该能够处理类型转换错误并使用默认值', () => {
      const script = `
        str_val = "abc"
        num_result = str_val * 2
        bool_result = str_val > 5
        "数字结果: " + num_result + ", 布尔结果: " + bool_result
      `;
      
      const result = executeScript(script);
      expect(result.success).toBe(true);
      expect(result.result).toBe('数字结果: 0, 布尔结果: 0');
    });
  });

  describe('需求覆盖验证', () => {
    it('应该验证所有基本数据类型支持', () => {
      const script = `
        num = 42
        str = "Hello"
        dice = 1d1
        "数字: " + num + ", 字符串: " + str + ", 掷骰: " + dice
      `;
      
      const result = executeScript(script);
      expect(result.success).toBe(true);
      expect(result.result).toBe('数字: 42, 字符串: Hello, 掷骰: 1');
      expect(result.errors).toHaveLength(0);
    });

    it('应该验证所有运算符支持', () => {
      const script = `
        a = 10
        b = 3
        arith = a + b - 2 * 3 / 2 % 2
        comp = a > b && b < 5 || a == 10
        assign_result = (a += 5)
        ternary = comp ? "真" : "假"
        "算术: " + arith + ", 逻辑: " + comp + ", 赋值: " + assign_result + ", 三元: " + ternary
      `;
      
      const result = executeScript(script);
      expect(result.success).toBe(true);
      expect(result.result).toBe('算术: 12, 逻辑: 1, 赋值: 15, 三元: 真');
      expect(result.errors).toHaveLength(0);
    });

    it('应该验证所有控制流结构支持', () => {
      const script = `
        result = ""
        x = 5
        
        if (x > 0) {
          result += "正数 "
        } else {
          result += "非正数 "
        }
        
        i = 0
        while (i < 3) {
          result += i + " "
          i += 1
        }
        
        final = x > 3 ? "大" : "小"
        result + final
      `;
      
      const result = executeScript(script);
      expect(result.success).toBe(true);
      expect(result.result).toBe('正数 0 1 2 大');
      expect(result.errors).toHaveLength(0);
    });

    it('应该验证字符串插值功能', () => {
      const options = {
        context: {
          variables: new Map([
            ['name', createStringValue('测试')],
            ['value', createNumberValue(100)]
          ])
        }
      };

      const script = `
        template = "用户 {$name} 的分数是 {$value}"
        template
      `;
      
      const result = executeScript(script, options);
      expect(result.success).toBe(true);
      expect(result.result).toBe('用户 测试 的分数是 100');
      expect(result.errors).toHaveLength(0);
    });
  });
});