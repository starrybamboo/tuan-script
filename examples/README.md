# Dicenic脚本示例

这个目录包含了Dicenic脚本语言的使用示例。

## 运行示例

### 1. 基本示例
```bash
npm run main examples/basic.dice
```

### 2. 带上下文的高级示例
```bash
npm run main examples/advanced.dice --context examples/context.json
```

### 3. 战斗系统示例
```bash
npm run main examples/combat.dice --verbose
```

## 文件说明

- `basic.dice` - 基本语法示例，展示变量、表达式和掷骰
- `advanced.dice` - 高级示例，使用特殊变量和上下文
- `combat.dice` - 战斗系统示例，模拟游戏战斗
- `context.json` - 上下文配置文件，定义角色属性和系统信息

## 上下文文件格式

上下文文件是JSON格式，包含以下字段：

```json
{
  "attributes": {
    "属性名": 数值或字符串
  },
  "roleInfo": {
    "角色信息名": 数值或字符串
  },
  "systemInfo": {
    "系统信息名": 数值或字符串
  },
  "diceInfo": {
    "骰娘信息名": 数值或字符串
  }
}
```

## 特殊变量

- `$a变量名` - 角色卡属性变量（可读写）
- `$r变量名` - 角色信息变量（只读）
- `$s变量名` - 系统信息变量（只读）
- `$d变量名` - 骰娘信息变量（可读写）

## 语法特性

- 变量赋值：`name = "值"`
- 掷骰表达式：`2d6`, `1d20+5`
- 字符串连接：`"Hello " + "World"`
- 条件表达式：`condition ? "真" : "假"`
- 算术运算：`+`, `-`, `*`, `/`, `%`
- 比较运算：`>`, `<`, `>=`, `<=`, `==`, `!=`
- 逻辑运算：`&&`, `||`, `!`
- 字符串转义：`\n`, `\t`, `\"`, `\'`