/**
 * 角色扮演游戏场景示例
 * 展示Dicenic Script Parser在RPG游戏中的实际应用
 */

import { 
  executeScript, 
  createNumberValue, 
  createStringValue 
} from '../src/index';

console.log('=== RPG游戏场景示例 ===\n');

// 角色数据
const characterData = {
  context: {
    attributes: new Map([
      ['力量', createNumberValue(16)],
      ['敏捷', createNumberValue(14)],
      ['智力', createNumberValue(12)],
      ['体质', createNumberValue(15)],
      ['感知', createNumberValue(13)],
      ['魅力', createNumberValue(11)],
      ['生命值', createNumberValue(68)],
      ['魔法值', createNumberValue(24)],
      ['护甲等级', createNumberValue(16)]
    ]),
    roleInfo: new Map([
      ['姓名', createStringValue('艾莉亚·月影')],
      ['职业', createStringValue('游侠')],
      ['等级', createNumberValue(5)],
      ['种族', createStringValue('精灵')]
    ]),
    systemInfo: new Map([
      ['难度等级', createNumberValue(15)],
      ['暴击确认', createNumberValue(20)],
      ['经验倍率', createNumberValue(1.2)]
    ])
  }
};

// 1. 属性检定
console.log('1. 属性检定场景');
const skillCheckScript = `
  // 力量检定 (搬动重物)
  difficulty = 15
  attribute_bonus = $a力量
  level_bonus = $r等级
  dice_roll = 1d20
  total = dice_roll + attribute_bonus + level_bonus
  success = total >= difficulty
  
  name = $r姓名
  result_text = success ? "成功" : "失败"
  margin = success ? (total - difficulty) : (difficulty - total)
  
  name + " 进行力量检定 (难度" + difficulty + "): " + total + " - " + result_text + 
  " (差距: " + margin + ")"
`;

console.log('场景: 角色尝试搬动一块重石');
const skillResult = executeScript(skillCheckScript, characterData);
console.log('结果:', skillResult.result);
console.log();

// 2. 战斗攻击
console.log('2. 战斗攻击场景');
const attackScript = `
  // 攻击检定
  attack_roll = 1d20
  str_bonus = ($a力量 - 10) / 2
  proficiency = 3  // 5级角色的熟练加值
  attack_total = attack_roll + str_bonus + proficiency
  
  // 目标护甲等级
  target_ac = 14
  hit = attack_total >= target_ac
  
  // 伤害计算
  damage = 0
  if (hit) {
    weapon_damage = 1d8  // 长剑伤害
    damage = weapon_damage + str_bonus
    
    // 检查暴击
    crit = attack_roll >= 20
    if (crit) {
      extra_damage = 1d8
      damage += extra_damage
    }
  }
  
  name = $r姓名
  hit_text = hit ? "命中" : "未命中"
  crit_text = (hit && attack_roll >= 20) ? " (暴击!)" : ""
  damage_text = hit ? (", 造成 " + damage + " 点伤害") : ""
  
  name + " 攻击: " + attack_total + " - " + hit_text + crit_text + damage_text
`;

console.log('场景: 角色攻击一个哥布林 (AC 14)');
const attackResult = executeScript(attackScript, characterData);
console.log('结果:', attackResult.result);
console.log();

// 3. 法术施放
console.log('3. 法术施放场景');
const spellScript = `
  // 检查魔法值
  spell_cost = 3
  current_mp = $a魔法值
  can_cast = current_mp >= spell_cost
  
  damage = 0
  if (can_cast) {
    // 法术攻击检定
    spell_attack = 1d20 + ($a智力 - 10) / 2 + 3  // 智力调整值 + 熟练加值
    target_ac = 12  // 目标法术防御
    hit = spell_attack >= target_ac
    
    if (hit) {
      // 火球术伤害
      damage = 3d6
    }
    
    // 消耗魔法值
    remaining_mp = current_mp - spell_cost
  }
  
  name = $r姓名
  if (!can_cast) {
    result = name + " 魔法值不足，无法施放法术"
  } else {
    hit_text = hit ? "命中" : "未命中"
    damage_text = hit ? (", 造成 " + damage + " 点火焰伤害") : ""
    mp_text = " (剩余魔法值: " + remaining_mp + ")"
    result = name + " 施放火球术: " + hit_text + damage_text + mp_text
  }
  
  result
`;

console.log('场景: 角色施放火球术攻击敌人');
const spellResult = executeScript(spellScript, characterData);
console.log('结果:', spellResult.result);
console.log();

// 4. 生命值管理
console.log('4. 生命值管理场景');
const healthScript = `
  current_hp = $a生命值
  max_hp = 75  // 假设最大生命值
  damage_taken = 2d6 + 3
  
  new_hp = current_hp - damage_taken
  
  // 确保生命值不低于0
  if (new_hp < 0) {
    new_hp = 0
  }
  
  // 计算生命值百分比
  hp_percentage = (new_hp * 100) / max_hp
  
  // 确定状态
  if (new_hp <= 0) {
    status = "倒下"
  } else {
    if (hp_percentage >= 75) {
      status = "健康"
    } else {
      if (hp_percentage >= 50) {
        status = "轻伤"
      } else {
        if (hp_percentage >= 25) {
          status = "重伤"
        } else {
          status = "濒死"
        }
      }
    }
  }
  
  name = $r姓名
  name + " 受到 " + damage_taken + " 点伤害，生命值: " + new_hp + "/" + max_hp + 
  " (" + hp_percentage + "%) - " + status
`;

console.log('场景: 角色在战斗中受到伤害');
const healthResult = executeScript(healthScript, characterData);
console.log('结果:', healthResult.result);
console.log();

// 5. 技能挑战
console.log('5. 技能挑战场景');
const skillChallengeScript = `
  // 多重技能挑战：潜行通过守卫
  name = $r姓名
  
  // 第一次检定：潜行
  stealth_roll = 1d20 + ($a敏捷 - 10) / 2 + 4  // 敏捷调整值 + 潜行熟练
  stealth_dc = 14
  stealth_success = stealth_roll >= stealth_dc
  
  result = name + " 潜行检定: " + stealth_roll
  
  if (stealth_success) {
    result += " - 成功通过第一个守卫"
    
    // 第二次检定：感知 (发现陷阱)
    perception_roll = 1d20 + ($a感知 - 10) / 2 + 2  // 感知调整值 + 部分熟练
    perception_dc = 16
    perception_success = perception_roll >= perception_dc
    
    result += "\\n感知检定: " + perception_roll
    
    if (perception_success) {
      result += " - 发现并避开了陷阱"
      
      // 第三次检定：开锁
      lockpick_roll = 1d20 + ($a敏捷 - 10) / 2 + 3  // 敏捷调整值 + 工具熟练
      lockpick_dc = 15
      lockpick_success = lockpick_roll >= lockpick_dc
      
      result += "\\n开锁检定: " + lockpick_roll
      
      if (lockpick_success) {
        result += " - 成功开锁！任务完成"
        exp_gained = 300
        result += "\\n获得经验值: " + exp_gained
      } else {
        result += " - 开锁失败，触发警报"
      }
    } else {
      result += " - 未能发现陷阱，触发机关"
    }
  } else {
    result += " - 被守卫发现，潜行失败"
  }
  
  result
`;

console.log('场景: 角色尝试潜入敌人据点');
const challengeResult = executeScript(skillChallengeScript, characterData);
console.log('结果:');
console.log(challengeResult.result.replace(/\\n/g, '\n'));
console.log();

// 6. 商店交易
console.log('6. 商店交易场景');
const tradeScript = `
  // 角色当前金币
  current_gold = 150
  
  // 商品信息
  item_name = "精制长剑"
  base_price = 100
  
  // 魅力影响价格
  charisma_bonus = ($a魅力 - 10) / 2
  haggle_roll = 1d20 + charisma_bonus
  
  // 根据交涉结果调整价格
  if (haggle_roll >= 20) {
    discount = 20  // 20%折扣
  } else {
    if (haggle_roll >= 15) {
      discount = 10  // 10%折扣
    } else {
      if (haggle_roll >= 10) {
        discount = 5   // 5%折扣
      } else {
        discount = 0   // 无折扣
      }
    }
  }
  
  final_price = base_price - (base_price * discount / 100)
  can_afford = current_gold >= final_price
  
  name = $r姓名
  result = name + " 尝试购买 " + item_name + "\\n"
  result += "交涉检定: " + haggle_roll
  
  if (discount > 0) {
    result += " - 成功获得 " + discount + "% 折扣"
  } else {
    result += " - 交涉失败，无折扣"
  }
  
  result += "\\n原价: " + base_price + " 金币，最终价格: " + final_price + " 金币"
  
  if (can_afford) {
    remaining_gold = current_gold - final_price
    result += "\\n交易成功！剩余金币: " + remaining_gold
  } else {
    needed_gold = final_price - current_gold
    result += "\\n金币不足，还需要 " + needed_gold + " 金币"
  }
  
  result
`;

console.log('场景: 角色在武器店购买装备');
const tradeResult = executeScript(tradeScript, characterData);
console.log('结果:');
console.log(tradeResult.result.replace(/\\n/g, '\n'));
console.log();

// 7. 休息恢复
console.log('7. 休息恢复场景');
const restScript = `
  name = $r姓名
  current_hp = $a生命值
  current_mp = $a魔法值
  max_hp = 75
  max_mp = 30
  constitution_bonus = ($a体质 - 10) / 2
  
  // 短休息恢复
  hp_recovery = 1d4 + constitution_bonus
  mp_recovery = 1d4 + ($a智力 - 10) / 2
  
  new_hp = current_hp + hp_recovery
  new_mp = current_mp + mp_recovery
  
  // 确保不超过最大值
  if (new_hp > max_hp) {
    new_hp = max_hp
  }
  if (new_mp > max_mp) {
    new_mp = max_mp
  }
  
  hp_recovered = new_hp - current_hp
  mp_recovered = new_mp - current_mp
  
  result = name + " 进行短休息恢复:\\n"
  result += "生命值恢复: " + hp_recovered + " 点 (" + current_hp + " → " + new_hp + "/" + max_hp + ")\\n"
  result += "魔法值恢复: " + mp_recovered + " 点 (" + current_mp + " → " + new_mp + "/" + max_mp + ")"
  
  result
`;

console.log('场景: 角色进行短休息恢复');
const restResult = executeScript(restScript, characterData);
console.log('结果:');
console.log(restResult.result.replace(/\\n/g, '\n'));
console.log();

// 8. 等级提升
console.log('8. 等级提升场景');
const levelUpScript = `
  name = $r姓名
  current_level = $r等级
  new_level = current_level + 1
  
  // 生命值提升
  hp_gain = 1d8 + ($a体质 - 10) / 2
  
  // 魔法值提升 (如果是施法者)
  mp_gain = 1d4 + ($a智力 - 10) / 2
  
  // 新的熟练加值
  old_proficiency = 2 + (current_level - 1) / 4
  new_proficiency = 2 + (new_level - 1) / 4
  proficiency_increase = new_proficiency - old_proficiency
  
  result = "🎉 " + name + " 升级了！\\n"
  result += "等级: " + current_level + " → " + new_level + "\\n"
  result += "生命值增加: " + hp_gain + " 点\\n"
  result += "魔法值增加: " + mp_gain + " 点\\n"
  
  if (proficiency_increase > 0) {
    result += "熟练加值提升: +" + proficiency_increase + "\\n"
  }
  
  // 检查是否获得新能力
  if (new_level == 6) {
    result += "🌟 获得新职业特性：额外攻击\\n"
  }
  
  if (new_level % 4 == 0) {
    result += "📈 可以提升一项属性值或选择专长"
  }
  
  result
`;

console.log('场景: 角色获得足够经验值升级');
const levelUpResult = executeScript(levelUpScript, characterData);
console.log('结果:');
console.log(levelUpResult.result.replace(/\\n/g, '\n'));
console.log();

console.log('=== RPG场景示例完成 ===');