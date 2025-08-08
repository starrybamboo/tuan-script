# Dicenic Script Parser

[![License: CC BY 4.0](https://img.shields.io/badge/License-CC%20BY%204.0-lightgrey.svg)](https://creativecommons.org/licenses/by/4.0/)

Dicenic脚本语言解析器 - 专为游戏应用设计的简单脚本语言解析器

## 特性

- 🎲 **掷骰表达式支持**: 支持 `2d6+3` 等掷骰语法
- 🔧 **变量系统**: 支持普通变量和特殊变量（角色属性、系统信息等）
- 🎯 **条件表达式**: 支持三元运算符和逻辑运算
- 🔄 **控制流**: 支持 if-else 和 while 循环
- 📝 **字符串处理**: 支持字符串连接和转义字符
- 🛡️ **错误恢复**: 智能错误处理和恢复机制
- 🎮 **游戏导向**: 专为游戏脚本设计的语法特性

## 快速开始

### 安装依赖

```bash
npm install
```

### 构建项目

```bash
npm run build
```

### 运行示例

```bash
# 基本示例
node dist/main.js examples/basic.dice

# 详细模式
node dist/main.js examples/basic.dice --verbose

# 使用上下文文件
node dist/main.js examples/advanced.dice --context examples/context.json
```

## 语法示例

### 基本变量和表达式

```dicenic
name = "勇敢的冒险者"
level = 5
hp = 100

damage = 2d6 + level
result = damage > 10 ? "高伤害" : "低伤害"

"角色: " + name + " 造成了 " + damage + " 点伤害 (" + result + ")"
```

### 特殊变量

```dicenic
// 角色卡属性（可读写）
$a力量 = 18
strength_bonus = ($a力量 - 10) / 2

// 角色信息（只读）
character_name = $r姓名

// 系统信息（只读）
game_version = $s版本

// 骰娘信息（可读写）
$d幸运值 = 7
```

### 控制流

```dicenic
hp = 75

status = hp > 80 ? "健康" : 
         hp > 50 ? "轻伤" : 
         hp > 20 ? "重伤" : "濒死"

if (hp > 0) {
    "角色状态: " + status
} else {
    "角色已死亡"
}
```

## API 使用

```typescript
import { executeScript, createStringValue, createNumberValue } from 'dicenic-script-parser';

// 基本使用
const result = executeScript('damage = 2d6 + 3; "伤害: " + damage');
console.log(result.result); // 输出: "伤害: 9" (随机值)

// 使用上下文
const context = {
  attributes: new Map([
    ['力量', createNumberValue(18)],
    ['敏捷', createNumberValue(14)]
  ]),
  roleInfo: new Map([
    ['姓名', createStringValue('艾莉亚')],
    ['职业', createStringValue('战士')]
  ])
};

const result2 = executeScript('$r姓名 + " 的力量是 " + $a力量', { context });
console.log(result2.result); // 输出: "艾莉亚 的力量是 18"
```

## 许可证和署名

本项目采用 [Creative Commons Attribution 4.0 International License](https://creativecommons.org/licenses/by/4.0/) 许可证。

### 署名要求

当您使用、分享或改编此作品时，您必须：

1. **给予适当的署名** - 提及原作者姓名
2. **提供许可证链接** - 链接到 CC BY 4.0 许可证
3. **说明是否有修改** - 如果您修改了作品，请说明
4. **不暗示背书** - 不要暗示许可方为您或您的使用背书

### 署名示例

```
"Dicenic Script Parser" by [Your Name] is licensed under CC BY 4.0.
Available at: [Repository URL]
```

或者在代码中：

```typescript
/*
 * Based on Dicenic Script Parser by [Your Name]
 * Licensed under CC BY 4.0: https://creativecommons.org/licenses/by/4.0/
 * Original source: [Repository URL]
 */
```

### 为什么选择 CC BY 4.0？

- ✅ **最大的自由度**: 允许任何用途，包括商业用途
- ✅ **强制署名**: 确保原作者得到应有的认可
- ✅ **国际通用**: 在全球范围内得到认可和执行
- ✅ **清晰明确**: 明确规定了使用者的义务

## 开发

### 运行测试

```bash
npm test
```

### 开发模式

```bash
npm run dev
```

### 代码检查

```bash
npm run lint
```

## 贡献

欢迎贡献代码！请确保：

1. 遵循现有的代码风格
2. 添加适当的测试
3. 更新相关文档
4. 在贡献中保持适当的署名

## 支持

如果您在使用过程中遇到问题，请：

1. 查看 [使用指南](USAGE.md)
2. 查看 [示例代码](examples/)
3. 提交 Issue

---

**注意**: 使用此软件即表示您同意遵守 CC BY 4.0 许可证的条款，包括适当的署名要求。