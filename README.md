# Dicenic Script Parser

Dicenic脚本语言解析器 - 专为游戏应用设计的简单脚本语言解析器，主要用于实现牌堆、自定义表达式、骰娘个性化设置等模块的安全自定义功能。

## 特性

- 支持数字、字符串和掷骰表达式
- 特殊变量系统（$a, $r, $s, $d前缀）
- 算术、比较和逻辑运算符
- 流程控制（if-else, while, 三元运算符）
- 字符串插值
- 基于ANTLR4的高性能解析器

## 项目结构

```
src/
├── grammar/          # ANTLR4语法文件
├── generated/        # ANTLR4生成的代码
├── interpreter/      # 解释器相关代码
├── utils/           # 工具类
├── errors/          # 错误类定义
└── index.ts         # 主入口文件
```

## 开发环境设置

### 依赖安装

```bash
npm install
```

### 构建项目

```bash
npm run build
```

### 运行测试

```bash
npm test
```

### 代码检查

```bash
npm run lint
```

### 开发模式

```bash
npm run dev
```

## 构建流程

1. `npm run antlr4` - 从语法文件生成解析器代码
2. `npm run build` - 编译TypeScript代码到dist目录

## 技术栈

- **TypeScript** - 主要开发语言
- **ANTLR4** - 语法解析器生成工具
- **Jest** - 测试框架
- **ESLint** - 代码检查工具

## 开发状态

当前项目处于开发阶段，已完成：

- [x] 项目环境配置和依赖安装
- [ ] ANTLR4语法文件定义
- [ ] 解析器代码生成和验证
- [ ] 核心类型系统实现
- [ ] 执行上下文管理
- [ ] 解释器实现

## 许可证

MIT License