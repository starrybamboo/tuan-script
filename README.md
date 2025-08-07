# Dicenic Script Parser

一个用于解析和执行Dicenic脚本语言的TypeScript解析器。Dicenic是一种专为角色扮演游戏设计的脚本语言，支持掷骰表达式、特殊变量、字符串插值等功能。

## 特性

- 🎲 **掷骰表达式** - 支持标准的掷骰语法（如 `3d6`, `1d20`）
- 🔢 **数值运算** - 完整的算术、比较和逻辑运算支持
- 📝 **字符串处理** - 字符串连接和插值功能
- 🎭 **特殊变量** - 角色属性、系统信息等特殊变量类型
- 🔄 **控制流** - if-else语句、while循环、三元运算符
- 🛡️ **错误处理** - 完善的错误恢复和处理机制
- 🌐 **中文支持** - 完全支持中文变量名和内容
- ⚡ **高性能** - 优化的解析和执行性能

## 安装

```bash
npm install dicenic-script-parser
```

## 快速开始

### 基本使用

```typescript
import { executeScript } from 'dicenic-script-parser';

// 简单的数学运算
const result1 = executeScript('1 + 2 * 3');
console.log(result1.result); // "7"

// 掷骰表达式
const result2 = executeScript('2d6 + 3');
console.log(result2.result); // 例如 "11"

// 变量和控制流
const result3 = executeScript(`
  hp = 100
  damage = 2d6
  hp = hp - damage
  hp > 0 ? "存活" : "死亡"
`);
console.log(result3.result); // 例如 "存活"
```

### 使用执行上下文

```typescript
import { executeScript, createNumberValue, createStringValue } from 'dicenic-script-parser';

const options = {
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

const script = `
  attack_bonus = $a力量
  level_bonus = $r等级
  dice_roll = 1d20
  total = dice_roll + attack_bonus + level_bonus
  name = $r姓名
  name + " 的攻击检定: " + total
`;

const result = executeScript(script, options);
console.log(result.result); // 例如 "艾莉亚 的攻击检定: 28"
```

### 字符串插值

```typescript
const options = {
  context: {
    variables: new Map([
      ['name', createStringValue('玩家')],
      ['level', createNumberValue(10)]
    ])
  }
};

const result = executeScript('"欢迎 {$name}，你的等级是 {$level}"', options);
console.log(result.result); // "欢迎 玩家，你的等级是 10"
```

## API 参考

### executeScript(script, options?)

执行Dicenic脚本并返回结果。

**参数：**
- `script: string` - 要执行的脚本代码
- `options?: ScriptOptions` - 执行选项（可选）

**返回值：** `ScriptResult`

```typescript
interface ScriptResult {
  result: string;      // 脚本执行的最终结果
  errors: string[];    // 执行过程中的错误
  warnings: string[];  // 执行过程中的警告
  success: boolean;    // 是否执行成功
}
```

### parseScript(script)

仅解析脚本，不执行。

**参数：**
- `script: string` - 要解析的脚本代码

**返回值：** `{ parser: DicenicParser; tree: any; hasErrors: boolean }`

### validateScript(script)

验证脚本语法。

**参数：**
- `script: string` - 要验证的脚本代码

**返回值：** `{ valid: boolean; errors: string[] }`

### createExecutionContext(data?)

创建执行上下文。

**参数：**
- `data?: Partial<ExecutionContextData>` - 初始上下文数据

**返回值：** `ExecutionContext`

### 辅助函数

- `createNumberValue(value: number): DicenicValue` - 创建数字值
- `createStringValue(value: string): DicenicValue` - 创建字符串值
- `createDiceValue(expression: string): DicenicValue` - 创建掷骰表达式值

## 语言语法

### 基本数据类型

```typescript
// 数字
42
3.14
-10

// 字符串
"Hello World"
'单引号字符串'
"包含\"转义\"的字符串"

// 掷骰表达式
1d6      // 投掷一个6面骰子
3d6      // 投掷三个6面骰子
2d10     // 投掷两个10面骰子
```

### 运算符

```typescript
// 算术运算符
1 + 2    // 加法
5 - 3    // 减法
4 * 6    // 乘法
8 / 2    // 除法
7 % 3    // 取模

// 比较运算符
5 > 3    // 大于
2 < 4    // 小于
5 >= 5   // 大于等于
3 <= 7   // 小于等于
4 == 4   // 等于
5 != 3   // 不等于

// 逻辑运算符
true && false   // 逻辑与
true || false   // 逻辑或
!true          // 逻辑非

// 赋值运算符
x = 10     // 基本赋值
x += 5     // 复合赋值
x -= 3
x *= 2
x /= 4
x %= 3
```

### 控制流

```typescript
// if-else语句
if (condition) {
  // 代码块
} else {
  // 代码块
}

// while循环
while (condition) {
  // 循环体
}

// 三元运算符
condition ? value_if_true : value_if_false
```

### 特殊变量

Dicenic支持四种特殊变量前缀：

- `$a` - 角色卡属性（可读写）
- `$r` - 角色信息（只读）
- `$s` - 系统信息（只读）
- `$d` - 骰娘信息（可读写）

```typescript
$a力量 = 16        // 设置角色力量属性
$r姓名             // 读取角色姓名
$s版本             // 读取系统版本
$d计数器 += 1      // 增加骰娘计数器
```

### 字符串插值

使用 `{$variable}` 语法在字符串中插入变量值：

```typescript
name = "张三"
level = 5
"角色 {$name} 的等级是 {$level}"  // "角色 张三 的等级是 5"
```

## 错误处理

解析器具有强大的错误处理和恢复机制：

```typescript
const result = executeScript(`
  valid_value = 10
  invalid_dice = 0d6  // 无效掷骰，但不会中断执行
  result = valid_value + invalid_dice + 5
  result
`);

console.log(result.success);    // true
console.log(result.result);     // "15" (0d6被当作0处理)
console.log(result.warnings);   // 包含掷骰错误警告
```

## 配置选项

### ScriptOptions

```typescript
interface ScriptOptions {
  context?: Partial<ExecutionContextData>;     // 执行上下文
  errorConfig?: Partial<ErrorHandlerConfig>;   // 错误处理配置
  enableErrorRecovery?: boolean;               // 是否启用错误恢复
}
```

### ErrorHandlerConfig

```typescript
interface ErrorHandlerConfig {
  enableRecovery: boolean;      // 启用错误恢复
  logWarnings: boolean;         // 记录警告
  maxErrors: number;           // 最大错误数量
  useDefaultOnTypeError: boolean; // 类型错误时使用默认值
}
```

## 实际应用示例

### 角色扮演游戏属性检定

```typescript
const character = {
  context: {
    attributes: new Map([
      ['力量', createNumberValue(16)],
      ['敏捷', createNumberValue(14)],
      ['智力', createNumberValue(12)]
    ]),
    roleInfo: new Map([
      ['姓名', createStringValue('勇者')],
      ['等级', createNumberValue(5)]
    ])
  }
};

const skillCheck = executeScript(`
  difficulty = 15
  attribute_bonus = $a力量
  level_bonus = $r等级
  dice_roll = 1d20
  total = dice_roll + attribute_bonus + level_bonus
  success = total >= difficulty
  result_text = success ? "成功" : "失败"
  name = $r姓名
  name + " 的力量检定 (难度" + difficulty + "): " + total + " - " + result_text
`, character);

console.log(skillCheck.result);
// 例如: "勇者 的力量检定 (难度15): 23 - 成功"
```

### 战斗伤害计算

```typescript
const combat = executeScript(`
  base_damage = 8
  weapon_damage = 2d6
  crit_roll = 1d100
  is_crit = crit_roll <= 20
  damage = base_damage + weapon_damage
  final_damage = is_crit ? damage * 2 : damage
  crit_text = is_crit ? " (暴击!)" : ""
  "造成伤害: " + final_damage + crit_text
`);

console.log(combat.result);
// 例如: "造成伤害: 28 (暴击!)"
```

### 商店价格计算

```typescript
const shop = {
  context: {
    systemInfo: new Map([
      ['折扣率', createNumberValue(10)],
      ['税率', createNumberValue(5)]
    ])
  }
};

const pricing = executeScript(`
  base_price = 100
  discount_rate = $s折扣率
  tax_rate = $s税率
  discounted_price = base_price - base_price * discount_rate / 100
  final_price = discounted_price + discounted_price * tax_rate / 100
  "原价: " + base_price + ", 折后价: " + discounted_price + ", 含税价: " + final_price
`, shop);

console.log(pricing.result);
// "原价: 100, 折后价: 90, 含税价: 94.5"
```

## 性能考虑

- 解析器经过优化，可以高效处理中等规模的脚本
- 支持错误恢复，避免单个错误导致整个脚本失败
- 内存使用经过优化，避免内存泄漏
- 支持并发执行多个脚本实例

## 开发和测试

```bash
# 安装依赖
npm install

# 运行测试
npm test

# 构建项目
npm run build

# 运行特定测试
npm test -- IntegrationTests.test.ts
```

## 许可证

MIT License

## 贡献

欢迎提交Issue和Pull Request来改进这个项目。

## 更新日志

### v1.0.0
- 初始版本发布
- 支持完整的Dicenic语言语法
- 包含错误处理和恢复机制
- 提供完整的API和文档