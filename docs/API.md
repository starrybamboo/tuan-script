# Dicenic Script Parser API 文档

本文档详细描述了Dicenic Script Parser的所有API接口。

## 目录

- [主要函数](#主要函数)
- [类型定义](#类型定义)
- [类和接口](#类和接口)
- [错误处理](#错误处理)
- [使用示例](#使用示例)

## 主要函数

### executeScript

执行Dicenic脚本并返回结果。

```typescript
function executeScript(script: string, options?: ScriptOptions): ScriptResult
```

**参数：**
- `script: string` - 要执行的脚本代码
- `options?: ScriptOptions` - 执行选项（可选）

**返回值：** `ScriptResult` - 执行结果

**示例：**
```typescript
import { executeScript } from 'dicenic-script-parser';

const result = executeScript('1 + 2 * 3');
console.log(result.result); // "7"
console.log(result.success); // true
console.log(result.errors); // []
```

### parseScript

仅解析脚本，不执行。用于语法验证或获取解析树。

```typescript
function parseScript(script: string): { 
  parser: DicenicParser; 
  tree: any; 
  hasErrors: boolean 
}
```

**参数：**
- `script: string` - 要解析的脚本代码

**返回值：**
- `parser: DicenicParser` - ANTLR解析器实例
- `tree: any` - 解析树
- `hasErrors: boolean` - 是否有语法错误

**示例：**
```typescript
import { parseScript } from 'dicenic-script-parser';

const { parser, tree, hasErrors } = parseScript('x = 1 + 2');
if (!hasErrors) {
  console.log('语法正确');
}
```

### validateScript

验证脚本语法，不执行脚本。

```typescript
function validateScript(script: string): { 
  valid: boolean; 
  errors: string[] 
}
```

**参数：**
- `script: string` - 要验证的脚本代码

**返回值：**
- `valid: boolean` - 语法是否有效
- `errors: string[]` - 语法错误列表

**示例：**
```typescript
import { validateScript } from 'dicenic-script-parser';

const validation = validateScript('1 + + 2');
console.log(validation.valid); // false
console.log(validation.errors); // ['Syntax error detected']
```

### createExecutionContext

创建执行上下文实例。

```typescript
function createExecutionContext(data?: Partial<ExecutionContextData>): ExecutionContext
```

**参数：**
- `data?: Partial<ExecutionContextData>` - 初始上下文数据

**返回值：** `ExecutionContext` - 执行上下文实例

**示例：**
```typescript
import { createExecutionContext, createNumberValue } from 'dicenic-script-parser';

const context = createExecutionContext({
  variables: new Map([
    ['x', createNumberValue(42)]
  ])
});
```

### createErrorHandler

创建错误处理器实例。

```typescript
function createErrorHandler(config?: Partial<ErrorHandlerConfig>): ErrorHandler
```

**参数：**
- `config?: Partial<ErrorHandlerConfig>` - 错误处理配置

**返回值：** `ErrorHandler` - 错误处理器实例

**示例：**
```typescript
import { createErrorHandler } from 'dicenic-script-parser';

const errorHandler = createErrorHandler({
  enableRecovery: false,
  logWarnings: true
});
```

### createDefaultContext

创建默认的执行上下文数据。

```typescript
function createDefaultContext(): ExecutionContextData
```

**返回值：** `ExecutionContextData` - 默认上下文数据

**示例：**
```typescript
import { createDefaultContext } from 'dicenic-script-parser';

const defaultData = createDefaultContext();
console.log(defaultData.variables); // Map {}
```

## 辅助函数

### createNumberValue

创建数字类型的DicenicValue。

```typescript
function createNumberValue(value: number): DicenicValue
```

**参数：**
- `value: number` - 数字值

**返回值：** `DicenicValue` - 数字类型的值对象

### createStringValue

创建字符串类型的DicenicValue。

```typescript
function createStringValue(value: string): DicenicValue
```

**参数：**
- `value: string` - 字符串值

**返回值：** `DicenicValue` - 字符串类型的值对象

### createDiceValue

创建掷骰表达式类型的DicenicValue。

```typescript
function createDiceValue(expression: string): DicenicValue
```

**参数：**
- `expression: string` - 掷骰表达式字符串

**返回值：** `DicenicValue` - 掷骰表达式类型的值对象

## 类型定义

### ScriptResult

脚本执行结果接口。

```typescript
interface ScriptResult {
  /** 脚本执行的最终结果值 */
  result: string;
  /** 执行过程中产生的错误 */
  errors: string[];
  /** 执行过程中产生的警告 */
  warnings: string[];
  /** 是否执行成功 */
  success: boolean;
}
```

### ScriptOptions

脚本执行选项接口。

```typescript
interface ScriptOptions {
  /** 执行上下文数据 */
  context?: Partial<ExecutionContextData>;
  /** 错误处理配置 */
  errorConfig?: Partial<ErrorHandlerConfig>;
  /** 是否启用错误恢复 */
  enableErrorRecovery?: boolean;
}
```

### DicenicValue

Dicenic值接口，表示脚本中的值。

```typescript
interface DicenicValue {
  type: VariableType;
  value: number | string;
}
```

### VariableType

变量类型枚举。

```typescript
enum VariableType {
  NUMBER = 'NUMBER',
  STRING = 'STRING',
  DICE_EXPRESSION = 'DICE_EXPRESSION'
}
```

### ExecutionContextData

执行上下文数据接口。

```typescript
interface ExecutionContextData {
  attributes: Map<string, DicenicValue>;    // $a 角色卡属性
  roleInfo: Map<string, DicenicValue>;      // $r 角色信息
  systemInfo: Map<string, DicenicValue>;    // $s 系统信息
  diceInfo: Map<string, DicenicValue>;      // $d 骰娘信息
  variables: Map<string, DicenicValue>;     // 普通变量
}
```

### ErrorHandlerConfig

错误处理配置接口。

```typescript
interface ErrorHandlerConfig {
  /** 是否启用错误恢复 */
  enableRecovery: boolean;
  /** 是否记录警告 */
  logWarnings: boolean;
  /** 最大错误数量，超过后停止执行 */
  maxErrors: number;
  /** 是否在类型转换失败时使用默认值 */
  useDefaultOnTypeError: boolean;
}
```

## 类和接口

### ExecutionContext

执行上下文类，管理变量存储和访问。

#### 方法

##### getVariable

获取普通变量的值。

```typescript
getVariable(name: string): DicenicValue
```

##### setVariable

设置普通变量的值。

```typescript
setVariable(name: string, value: DicenicValue): void
```

##### getSpecialVariable

获取特殊变量的值。

```typescript
getSpecialVariable(prefix: string, name: string): DicenicValue
```

##### setSpecialVariable

设置特殊变量的值（仅对可写的特殊变量有效）。

```typescript
setSpecialVariable(prefix: string, name: string, value: DicenicValue): void
```

##### getSnapshot

获取当前上下文的快照。

```typescript
getSnapshot(): ExecutionContextData
```

**示例：**
```typescript
import { createExecutionContext, createNumberValue } from 'dicenic-script-parser';

const context = createExecutionContext();

// 设置普通变量
context.setVariable('x', createNumberValue(42));

// 获取普通变量
const x = context.getVariable('x');
console.log(x.value); // 42

// 设置特殊变量
context.setSpecialVariable('a', '力量', createNumberValue(16));

// 获取特殊变量
const strength = context.getSpecialVariable('a', '力量');
console.log(strength.value); // 16
```

### ErrorHandler

错误处理器类，管理错误处理和恢复。

#### 方法

##### getErrors

获取所有错误。

```typescript
getErrors(): DicenicError[]
```

##### getWarnings

获取所有警告。

```typescript
getWarnings(): string[]
```

##### hasErrors

检查是否有错误。

```typescript
hasErrors(): boolean
```

##### hasWarnings

检查是否有警告。

```typescript
hasWarnings(): boolean
```

##### clearErrors

清空所有错误。

```typescript
clearErrors(): void
```

##### clearWarnings

清空所有警告。

```typescript
clearWarnings(): void
```

**示例：**
```typescript
import { createErrorHandler } from 'dicenic-script-parser';

const errorHandler = createErrorHandler();

// 检查错误状态
if (errorHandler.hasErrors()) {
  const errors = errorHandler.getErrors();
  console.log('发现错误:', errors.length);
}

// 清空错误
errorHandler.clearErrors();
```

### DicenicInterpreter

Dicenic脚本解释器类。

#### 构造函数

```typescript
constructor(context?: ExecutionContext, errorHandler?: ErrorHandler)
```

#### 方法

##### interpret

解释执行解析树。

```typescript
interpret(parseTree: ParseTree): string
```

##### getContext

获取执行上下文。

```typescript
getContext(): ExecutionContext
```

##### setContext

设置执行上下文。

```typescript
setContext(context: ExecutionContext): void
```

##### getErrorHandler

获取错误处理器。

```typescript
getErrorHandler(): ErrorHandler
```

##### setErrorHandler

设置错误处理器。

```typescript
setErrorHandler(errorHandler: ErrorHandler): void
```

**示例：**
```typescript
import { DicenicInterpreter, createExecutionContext } from 'dicenic-script-parser';
import { parseScript } from 'dicenic-script-parser';

const context = createExecutionContext();
const interpreter = new DicenicInterpreter(context);

const { tree } = parseScript('1 + 2');
const result = interpreter.interpret(tree);
console.log(result); // "3"
```

## 错误处理

### 错误类型

#### DicenicError

基础错误类。

```typescript
class DicenicError extends Error {
  line: number;
  column: number;
  
  getFormattedMessage(): string;
  toJSON(): object;
}
```

#### SyntaxError

语法错误类。

```typescript
class SyntaxError extends DicenicError {
  constructor(message: string, line?: number, column?: number);
}
```

#### RuntimeError

运行时错误类。

```typescript
class RuntimeError extends DicenicError {
  context?: string;
  
  constructor(message: string, line?: number, column?: number, context?: string);
}
```

#### TypeConversionError

类型转换错误类。

```typescript
class TypeConversionError extends DicenicError {
  sourceType: string;
  targetType: string;
  sourceValue: any;
  
  constructor(message: string, sourceType: string, targetType: string, sourceValue: any);
}
```

#### VariableAccessError

变量访问错误类。

```typescript
class VariableAccessError extends DicenicError {
  variableName: string;
  accessType: string;
  
  constructor(message: string, variableName: string, accessType: string);
}
```

#### DiceError

掷骰错误类。

```typescript
class DiceError extends DicenicError {
  diceExpression: string;
  
  constructor(message: string, diceExpression: string, line?: number, column?: number);
}
```

#### LoopError

循环错误类。

```typescript
class LoopError extends DicenicError {
  loopType: string;
  maxIterations?: number;
  
  constructor(message: string, loopType: string, maxIterations?: number, line?: number, column?: number);
}
```

## 使用示例

### 基本脚本执行

```typescript
import { executeScript } from 'dicenic-script-parser';

// 简单计算
const result1 = executeScript('2 + 3 * 4');
console.log(result1.result); // "14"

// 变量使用
const result2 = executeScript(`
  x = 10
  y = 20
  x + y
`);
console.log(result2.result); // "30"

// 掷骰
const result3 = executeScript('3d6 + 5');
console.log(result3.result); // 例如 "16"
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
      ['姓名', createStringValue('勇者')],
      ['等级', createNumberValue(5)]
    ]),
    variables: new Map([
      ['bonus', createNumberValue(3)]
    ])
  }
};

const script = `
  attack = $a力量 + $r等级 + bonus + 1d20
  name = $r姓名
  name + " 的攻击检定: " + attack
`;

const result = executeScript(script, options);
console.log(result.result); // 例如 "勇者 的攻击检定: 28"
```

### 错误处理示例

```typescript
import { executeScript } from 'dicenic-script-parser';

// 语法错误
const result1 = executeScript('1 + + 2');
console.log(result1.success); // false
console.log(result1.errors); // ['Syntax error in script']

// 运行时错误（错误恢复）
const result2 = executeScript(`
  valid = 10
  invalid = 0d6
  result = valid + invalid + 5
  result
`);
console.log(result2.success); // true
console.log(result2.result); // "15"
console.log(result2.warnings.length > 0); // true
```

### 自定义错误处理

```typescript
import { executeScript, createErrorHandler } from 'dicenic-script-parser';

const errorHandler = createErrorHandler({
  enableRecovery: false,  // 禁用错误恢复
  logWarnings: false,     // 不记录警告
  maxErrors: 5           // 最多5个错误
});

const result = executeScript('invalid script', {
  errorConfig: {
    enableRecovery: false,
    logWarnings: false
  }
});
```

### 字符串插值

```typescript
import { executeScript, createStringValue, createNumberValue } from 'dicenic-script-parser';

const options = {
  context: {
    variables: new Map([
      ['name', createStringValue('张三')],
      ['level', createNumberValue(10)],
      ['hp', createNumberValue(85)]
    ])
  }
};

const result = executeScript(
  '"玩家 {$name} (等级 {$level}) 当前生命值: {$hp}"',
  options
);
console.log(result.result); // "玩家 张三 (等级 10) 当前生命值: 85"
```

### 复杂脚本示例

```typescript
import { executeScript, createNumberValue, createStringValue } from 'dicenic-script-parser';

const gameState = {
  context: {
    attributes: new Map([
      ['力量', createNumberValue(16)],
      ['敏捷', createNumberValue(14)],
      ['生命值', createNumberValue(45)]
    ]),
    roleInfo: new Map([
      ['姓名', createStringValue('艾莉亚')],
      ['职业', createStringValue('游侠')]
    ]),
    systemInfo: new Map([
      ['难度', createNumberValue(15)]
    ])
  }
};

const combatScript = `
  // 计算攻击加值
  str_bonus = $a力量
  dex_bonus = $a敏捷
  attack_bonus = str_bonus > dex_bonus ? str_bonus : dex_bonus
  
  // 投掷攻击
  attack_roll = 1d20 + attack_bonus
  difficulty = $s难度
  hit = attack_roll >= difficulty
  
  // 计算伤害
  damage = 0
  if (hit) {
    base_damage = 1d8
    str_damage = $a力量 > 12 ? ($a力量 - 10) / 2 : 0
    damage = base_damage + str_damage
  }
  
  // 更新生命值
  current_hp = $a生命值 - damage
  
  // 生成战斗报告
  name = $r姓名
  profession = $r职业
  hit_text = hit ? "命中" : "未命中"
  damage_text = damage > 0 ? (", 造成 " + damage + " 点伤害") : ""
  
  name + "(" + profession + ") 攻击检定: " + attack_roll + " - " + hit_text + damage_text
`;

const result = executeScript(combatScript, gameState);
console.log(result.result);
// 例如: "艾莉亚(游侠) 攻击检定: 23 - 命中, 造成 8 点伤害"
```

这个API文档提供了Dicenic Script Parser的完整API参考，包括所有函数、类型、类和使用示例。