/**
 * Dicenic Script Parser 基本使用示例
 */

import { 
  executeScript, 
  createNumberValue, 
  createStringValue,
  createExecutionContext 
} from '../src/index';

console.log('=== Dicenic Script Parser 基本使用示例 ===\n');

// 1. 基本数学运算
console.log('1. 基本数学运算');
console.log('脚本: "1 + 2 * 3"');
const result1 = executeScript('1 + 2 * 3');
console.log('结果:', result1.result);
console.log('成功:', result1.success);
console.log();

// 2. 变量使用
console.log('2. 变量使用');
const script2 = `
  x = 10
  y = 20
  result = x + y
  result
`;
console.log('脚本:', script2.trim());
const result2 = executeScript(script2);
console.log('结果:', result2.result);
console.log();

// 3. 掷骰表达式
console.log('3. 掷骰表达式');
console.log('脚本: "3d6 + 2"');
const result3 = executeScript('3d6 + 2');
console.log('结果:', result3.result, '(随机值)');
console.log();

// 4. 字符串操作
console.log('4. 字符串操作');
console.log('脚本: \'"Hello " + "World"\'');
const result4 = executeScript('"Hello " + "World"');
console.log('结果:', result4.result);
console.log();

// 5. 条件判断
console.log('5. 条件判断');
const script5 = `
  hp = 75
  status = hp > 50 ? "健康" : "受伤"
  status
`;
console.log('脚本:', script5.trim());
const result5 = executeScript(script5);
console.log('结果:', result5.result);
console.log();

// 6. if-else语句
console.log('6. if-else语句');
const script6 = `
  score = 85
  if (score >= 90) {
    grade = "A"
  } else {
    if (score >= 80) {
      grade = "B"
    } else {
      grade = "C"
    }
  }
  grade
`;
console.log('脚本:', script6.trim());
const result6 = executeScript(script6);
console.log('结果:', result6.result);
console.log();

// 7. while循环
console.log('7. while循环');
const script7 = `
  sum = 0
  i = 1
  while (i <= 5) {
    sum += i
    i += 1
  }
  sum
`;
console.log('脚本:', script7.trim());
const result7 = executeScript(script7);
console.log('结果:', result7.result, '(1+2+3+4+5 = 15)');
console.log();

// 8. 使用执行上下文
console.log('8. 使用执行上下文');
const options = {
  context: {
    variables: new Map([
      ['base_hp', createNumberValue(100)],
      ['player_name', createStringValue('勇者')]
    ])
  }
};

const script8 = `
  current_hp = base_hp - 25
  message = player_name + " 的生命值: " + current_hp
  message
`;
console.log('脚本:', script8.trim());
const result8 = executeScript(script8, options);
console.log('结果:', result8.result);
console.log();

// 9. 特殊变量使用
console.log('9. 特殊变量使用');
const characterOptions = {
  context: {
    attributes: new Map([
      ['力量', createNumberValue(16)],
      ['敏捷', createNumberValue(14)]
    ]),
    roleInfo: new Map([
      ['姓名', createStringValue('艾莉亚')],
      ['等级', createNumberValue(5)]
    ])
  }
};

const script9 = `
  attack_bonus = $a力量
  level_bonus = $r等级
  total_bonus = attack_bonus + level_bonus
  name = $r姓名
  name + " 的攻击加值: " + total_bonus
`;
console.log('脚本:', script9.trim());
const result9 = executeScript(script9, characterOptions);
console.log('结果:', result9.result);
console.log();

// 10. 字符串插值
console.log('10. 字符串插值');
const interpolationOptions = {
  context: {
    variables: new Map([
      ['name', createStringValue('张三')],
      ['level', createNumberValue(10)],
      ['exp', createNumberValue(2500)]
    ])
  }
};

const script10 = '"玩家 {$name} (等级 {$level}) 经验值: {$exp}"';
console.log('脚本:', script10);
const result10 = executeScript(script10, interpolationOptions);
console.log('结果:', result10.result);
console.log();

// 11. 错误处理示例
console.log('11. 错误处理示例');
console.log('脚本: "10 / 0" (除零错误)');
const result11 = executeScript('10 / 0');
console.log('结果:', result11.result);
console.log('成功:', result11.success);
console.log('警告数量:', result11.warnings.length);
if (result11.warnings.length > 0) {
  console.log('警告:', result11.warnings[0]);
}
console.log();

// 12. 复杂脚本示例
console.log('12. 复杂脚本示例 - 角色战斗');
const combatOptions = {
  context: {
    attributes: new Map([
      ['力量', createNumberValue(16)],
      ['生命值', createNumberValue(80)]
    ]),
    roleInfo: new Map([
      ['姓名', createStringValue('战士')],
      ['职业', createStringValue('战士')]
    ])
  }
};

const combatScript = `
  // 计算攻击伤害
  base_damage = 1d8
  str_bonus = ($a力量 - 10) / 2
  total_damage = base_damage + str_bonus
  
  // 更新生命值
  new_hp = $a生命值 - total_damage
  
  // 判断状态
  if (new_hp <= 0) {
    status = "倒下"
  } else {
    if (new_hp < 20) {
      status = "重伤"
    } else {
      status = "轻伤"
    }
  }
  
  // 生成战斗报告
  name = $r姓名
  profession = $r职业
  name + "(" + profession + ") 受到 " + total_damage + " 点伤害，当前状态: " + status
`;

console.log('脚本: [复杂战斗计算脚本]');
const result12 = executeScript(combatScript, combatOptions);
console.log('结果:', result12.result);
console.log('成功:', result12.success);
console.log();

console.log('=== 示例完成 ===');