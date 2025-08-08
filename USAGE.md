# Dicenic脚本语言使用指南

## 快速开始

### 1. 构建项目
```bash
npm run build
```

### 2. 运行脚本文件
```bash
# 基本用法
node dist/main.js <script-file>

# 或者使用npm脚本
npm run run-script <script-file>
```

## 命令行选项

- `--help, -h`: 显示帮助信息
- `--verbose, -v`: 显示详细输出（包括执行时间、警告等）
- `--context, -c <file>`: 指定上下文JSON文件

## 示例用法

### 基本脚本执行
```bash
node dist/main.js examples/basic.dice
```

### 详细模式执行
```bash
node dist/main.js examples/basic.dice --verbose
```

### 使用上下文文件
```bash
node dist/main.js examples/advanced.dice --context examples/context.json
```

### 查看帮助
```bash
node dist/main.js --help
```

## 脚本语法

### 变量和赋值
```dicenic
name = "勇者"
level = 10
hp = 100
```

### 掷骰表达式
```dicenic
damage = 2d6 + 3    // 掷两个六面骰子加3
attack = 1d20       // 掷一个二十面骰子
```

### 字符串操作
```dicenic
greeting = "你好, " + name
message = "角色等级: " + level
```

### 条件表达式
```dicenic
status = hp > 50 ? "健康" : "受伤"
result = roll >= 15 ? "成功" : "失败"
```

### 特殊变量
```dicenic
// 角色卡属性（可读写）
$a力量 = 18
strength = $a力量

// 角色信息（只读）
character_name = $r姓名

// 系统信息（只读）
game_version = $s版本

// 骰娘信息（可读写）
$d幸运值 = 7
```

### 算术运算
```dicenic
total = base + bonus
average = (roll1 + roll2) / 2
modifier = (attribute - 10) / 2
```

### 字符串转义
```dicenic
message = "第一行\n第二行\t制表符"
quote = "他说:\"你好\""
```

## 上下文文件格式

创建一个JSON文件来定义初始上下文：

```json
{
  "attributes": {
    "力量": 18,
    "敏捷": 14,
    "智力": 12,
    "生命值": 100
  },
  "roleInfo": {
    "姓名": "艾莉亚",
    "职业": "战士",
    "等级": 10
  },
  "systemInfo": {
    "版本": "1.0.0",
    "游戏名": "龙与地下城"
  },
  "diceInfo": {
    "幸运值": 7,
    "暴击率": 15
  }
}
```

## 错误处理

脚本执行器支持错误恢复机制：

- **警告**: 不会停止执行，如除零操作
- **错误**: 在错误恢复模式下会记录但继续执行
- **致命错误**: 会停止执行并显示错误信息

使用 `--verbose` 选项可以查看详细的错误和警告信息。

## 示例脚本

查看 `examples/` 目录中的示例脚本：

- `basic.dice` - 基本语法示例
- `advanced.dice` - 使用特殊变量和上下文
- `combat.dice` - 战斗系统模拟
- `error-recovery.dice` - 错误恢复示例

## 开发模式

如果你想修改和调试脚本解析器：

```bash
# 监视模式构建
npm run dev

# 运行测试
npm test

# 监视模式测试
npm run test:watch
```