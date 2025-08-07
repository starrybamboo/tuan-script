# Dicenic 语言语法参考

本文档详细描述了Dicenic脚本语言的完整语法规范。

## 目录

- [词法规则](#词法规则)
- [语法规则](#语法规则)
- [运算符优先级](#运算符优先级)
- [数据类型](#数据类型)
- [变量和标识符](#变量和标识符)
- [表达式](#表达式)
- [语句](#语句)
- [特殊变量](#特殊变量)
- [字符串插值](#字符串插值)
- [错误处理](#错误处理)

## 词法规则

### 数字字面量

```
NUMBER: [0-9]+ ('.' [0-9]+)?
```

支持整数和浮点数：
- `42` - 整数
- `3.14` - 浮点数
- `-10` - 负数（通过一元运算符实现）

### 字符串字面量

```
STRING: '"' (~["\r\n] | '\\' .)* '"'
      | '\'' (~['\r\n] | '\\' .)* '\''
```

支持双引号和单引号字符串：
- `"Hello World"` - 双引号字符串
- `'Hello World'` - 单引号字符串
- `"包含\"转义\"的字符串"` - 转义字符

支持的转义序列：
- `\"` - 双引号
- `\'` - 单引号
- `\\` - 反斜杠
- `\n` - 换行符
- `\t` - 制表符
- `\r` - 回车符

### 掷骰表达式

```
DICE: [0-9]+ [dD] [0-9]+
```

格式：`数量d面数` 或 `数量D面数`
- `1d6` - 投掷一个6面骰子
- `3d6` - 投掷三个6面骰子
- `2D10` - 投掷两个10面骰子（大写D也支持）

### 特殊变量

```
SPECIAL_VAR: '$' [arsd] [a-zA-Z_\u4e00-\u9fff][a-zA-Z0-9_\u4e00-\u9fff]*
```

格式：`$前缀变量名`
- `$a力量` - 角色属性变量
- `$r姓名` - 角色信息变量
- `$s版本` - 系统信息变量
- `$d计数器` - 骰娘信息变量

### 标识符

```
IDENTIFIER: [a-zA-Z_\u4e00-\u9fff][a-zA-Z0-9_\u4e00-\u9fff]*
```

支持英文、中文和下划线：
- `variable` - 英文变量名
- `变量` - 中文变量名
- `my_var` - 包含下划线的变量名
- `变量_1` - 混合变量名

### 运算符和分隔符

```
// 算术运算符
'+' | '-' | '*' | '/' | '%'

// 比较运算符
'>' | '<' | '>=' | '<=' | '==' | '!='

// 逻辑运算符
'&&' | '||' | '!'

// 赋值运算符
'=' | '+=' | '-=' | '*=' | '/=' | '%='

// 其他符号
'(' | ')' | '{' | '}' | '?' | ':' | ';'
```

### 注释

```
// 单行注释（当前版本不支持，但语法保留）
/* 多行注释（当前版本不支持，但语法保留） */
```

## 语法规则

### 程序结构

```
program: statement* EOF
```

程序由零个或多个语句组成。

### 语句

```
statement:
    | ifStatement
    | whileStatement
    | expressionStatement
    | block
```

#### if语句

```
ifStatement: 'if' '(' expression ')' statement ('else' statement)?
```

示例：
```typescript
if (x > 0) {
    result = "正数"
} else {
    result = "非正数"
}
```

#### while循环

```
whileStatement: 'while' '(' expression ')' statement
```

示例：
```typescript
while (i < 10) {
    sum += i
    i += 1
}
```

#### 表达式语句

```
expressionStatement: expression
```

任何表达式都可以作为语句。

#### 代码块

```
block: '{' statement* '}'
```

用花括号包围的语句序列。

### 表达式层次结构

表达式按优先级从低到高排列：

```
expression: ternaryExpression

ternaryExpression: logicalOrExpression ('?' expression ':' expression)?

logicalOrExpression: logicalAndExpression ('||' logicalAndExpression)*

logicalAndExpression: equalityExpression ('&&' equalityExpression)*

equalityExpression: relationalExpression (('==' | '!=') relationalExpression)*

relationalExpression: additiveExpression (('>' | '<' | '>=' | '<=') additiveExpression)*

additiveExpression: multiplicativeExpression (('+' | '-') multiplicativeExpression)*

multiplicativeExpression: unaryExpression (('*' | '/' | '%') unaryExpression)*

unaryExpression: ('!' | '+' | '-')? assignmentExpression

assignmentExpression: postfixExpression (('=' | '+=' | '-=' | '*=' | '/=' | '%=') expression)?

postfixExpression: primaryExpression

primaryExpression:
    | numberLiteral
    | stringLiteral
    | diceExpression
    | specialVariable
    | identifier
    | '(' expression ')'
```

## 运算符优先级

从高到低：

1. **括号** `()`
2. **一元运算符** `!`, `+`, `-`
3. **乘除取模** `*`, `/`, `%`
4. **加减** `+`, `-`
5. **关系运算符** `>`, `<`, `>=`, `<=`
6. **相等运算符** `==`, `!=`
7. **逻辑与** `&&`
8. **逻辑或** `||`
9. **三元运算符** `? :`
10. **赋值运算符** `=`, `+=`, `-=`, `*=`, `/=`, `%=`

## 数据类型

### 数字类型 (NUMBER)

- 整数：`42`, `-10`, `0`
- 浮点数：`3.14`, `-2.5`, `0.1`

### 字符串类型 (STRING)

- 双引号：`"Hello World"`
- 单引号：`'Hello World'`
- 支持转义：`"Hello \"World\""`

### 掷骰表达式类型 (DICE_EXPRESSION)

- 标准格式：`3d6`, `1d20`
- 大写D：`2D10`

## 变量和标识符

### 普通变量

```typescript
// 声明和赋值
variable_name = 42
中文变量 = "测试"
my_var = 3d6

// 使用
result = variable_name + 10
```

### 特殊变量

#### 角色卡属性 ($a)

可读写的角色属性变量：

```typescript
$a力量 = 16
$a敏捷 = 14
attack_bonus = $a力量
```

#### 角色信息 ($r)

只读的角色信息变量：

```typescript
name = $r姓名
level = $r等级
// $r姓名 = "新名字"  // 错误：不能写入只读变量
```

#### 系统信息 ($s)

只读的系统信息变量：

```typescript
version = $s版本
mode = $s模式
// $s版本 = "2.0"  // 错误：不能写入只读变量
```

#### 骰娘信息 ($d)

可读写的骰娘信息变量：

```typescript
$d计数器 = 0
$d计数器 += 1
count = $d计数器
```

## 表达式

### 算术表达式

```typescript
1 + 2          // 加法
5 - 3          // 减法
4 * 6          // 乘法
8 / 2          // 除法
7 % 3          // 取模
```

### 比较表达式

```typescript
5 > 3          // 大于
2 < 4          // 小于
5 >= 5         // 大于等于
3 <= 7         // 小于等于
4 == 4         // 等于
5 != 3         // 不等于
```

### 逻辑表达式

```typescript
true && false   // 逻辑与
true || false   // 逻辑或
!true          // 逻辑非
```

### 赋值表达式

```typescript
x = 10         // 基本赋值
x += 5         // 加法赋值
x -= 3         // 减法赋值
x *= 2         // 乘法赋值
x /= 4         // 除法赋值
x %= 3         // 取模赋值
```

### 三元表达式

```typescript
condition ? value_if_true : value_if_false

// 示例
result = x > 0 ? "正数" : "非正数"
max = a > b ? a : b
```

### 掷骰表达式

```typescript
1d6            // 投掷一个6面骰子
3d6            // 投掷三个6面骰子
2d10 + 5       // 投掷两个10面骰子并加5
```

## 语句

### 表达式语句

任何表达式都可以作为语句：

```typescript
42             // 数字字面量
x + y          // 算术表达式
func()         // 函数调用（如果支持）
```

### if-else语句

```typescript
// 基本if语句
if (condition) {
    // 代码块
}

// if-else语句
if (condition) {
    // 条件为真时执行
} else {
    // 条件为假时执行
}

// 嵌套if语句
if (condition1) {
    if (condition2) {
        // 嵌套条件
    }
} else {
    // else分支
}
```

### while循环

```typescript
// 基本while循环
while (condition) {
    // 循环体
}

// 示例：计数循环
i = 0
while (i < 10) {
    sum += i
    i += 1
}
```

### 代码块

```typescript
{
    // 代码块内的语句
    x = 10
    y = 20
    result = x + y
}
```

## 特殊变量

### 变量前缀

- `$a` - 角色卡属性（Attribute）- 可读写
- `$r` - 角色信息（Role）- 只读
- `$s` - 系统信息（System）- 只读
- `$d` - 骰娘信息（Dice）- 可读写

### 访问权限

```typescript
// 可读写变量
$a力量 = 16        // ✓ 可以写入
strength = $a力量   // ✓ 可以读取

// 只读变量
name = $r姓名       // ✓ 可以读取
$r姓名 = "新名字"   // ✗ 错误：不能写入只读变量
```

### 默认值

未定义的特殊变量有不同的默认值：

- `$a` 和 `$d` 变量：默认值为 `0`（数字类型）
- `$r` 和 `$s` 变量：默认值为 `""`（空字符串）

## 字符串插值

### 基本语法

使用 `{$variable}` 语法在字符串中插入变量值：

```typescript
name = "张三"
level = 5
message = "角色 {$name} 的等级是 {$level}"
// 结果: "角色 张三 的等级是 5"
```

### 特殊变量插值

```typescript
"角色名: {$r姓名}, 力量: {$a力量}"
```

### 复杂表达式插值

```typescript
x = 10
y = 20
"x={$x}, y={$y}, sum={$x}+{$y}"
// 结果: "x=10, y=20, sum=10+20"
```

## 错误处理

### 语法错误

语法错误会阻止脚本执行：

```typescript
1 + + 2        // 语法错误：无效的表达式
if (x > 0      // 语法错误：缺少右括号
```

### 运行时错误

运行时错误可以通过错误恢复机制处理：

```typescript
// 除零错误
result = 10 / 0    // 警告：除零，返回0

// 无效掷骰
dice = 0d6         // 警告：无效掷骰，返回0

// 只读变量写入
$r姓名 = "新名字"   // 错误：不能写入只读变量
```

### 类型转换错误

类型转换失败时使用默认值：

```typescript
str = "abc"
num = str * 2      // 警告：类型转换失败，str被当作0处理
// 结果: num = 0
```

## 最佳实践

### 变量命名

```typescript
// 推荐：使用有意义的变量名
player_hp = 100
attack_damage = 2d6

// 不推荐：使用无意义的变量名
x = 100
y = 2d6
```

### 代码组织

```typescript
// 推荐：使用代码块组织相关代码
{
    // 初始化
    hp = 100
    mp = 50
}

{
    // 战斗计算
    damage = 2d6 + 3
    hp -= damage
}

{
    // 结果判断
    status = hp > 0 ? "存活" : "死亡"
}
```

### 错误处理

```typescript
// 推荐：检查关键值
if (hp > 0) {
    // 角色存活时的逻辑
} else {
    // 角色死亡时的逻辑
}

// 推荐：使用有意义的默认值
damage = weapon_damage > 0 ? weapon_damage : 1
```

### 性能考虑

```typescript
// 推荐：避免不必要的重复计算
base_damage = 2d6
total_damage = base_damage + strength_bonus

// 不推荐：重复计算
total_damage = 2d6 + strength_bonus + 2d6  // 2d6被计算两次
```

## 语法图表

### 表达式优先级图

```
expression
    ↓
ternaryExpression (? :)
    ↓
logicalOrExpression (||)
    ↓
logicalAndExpression (&&)
    ↓
equalityExpression (== !=)
    ↓
relationalExpression (> < >= <=)
    ↓
additiveExpression (+ -)
    ↓
multiplicativeExpression (* / %)
    ↓
unaryExpression (! + -)
    ↓
assignmentExpression (= += -= *= /= %=)
    ↓
postfixExpression
    ↓
primaryExpression
```

### 语句结构图

```
program
    ↓
statement*
    ↓
┌─────────────┬─────────────┬─────────────┬─────────────┐
│ ifStatement │whileStatement│expressionStatement│ block │
└─────────────┴─────────────┴─────────────┴─────────────┘
```

这个语法参考文档涵盖了Dicenic语言的所有语法特性，可以作为开发者的完整参考指南。