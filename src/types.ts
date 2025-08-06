/**
 * Token 类型枚举
 */
export enum TokenType {
  // 字面量
  NUMBER = 'NUMBER',
  STRING = 'STRING',
  DICE_EXPRESSION = 'DICE_EXPRESSION',
  
  // 标识符和变量
  IDENTIFIER = 'IDENTIFIER',
  SPECIAL_VAR = 'SPECIAL_VAR', // $a, $r, $s, $d
  
  // 运算符
  PLUS = 'PLUS',           // +
  MINUS = 'MINUS',         // -
  MULTIPLY = 'MULTIPLY',   // *
  DIVIDE = 'DIVIDE',       // /
  MODULO = 'MODULO',       // %
  
  // 赋值运算符
  ASSIGN = 'ASSIGN',       // =
  PLUS_ASSIGN = 'PLUS_ASSIGN',     // +=
  MINUS_ASSIGN = 'MINUS_ASSIGN',   // -=
  MULTIPLY_ASSIGN = 'MULTIPLY_ASSIGN', // *=
  DIVIDE_ASSIGN = 'DIVIDE_ASSIGN',     // /=
  MODULO_ASSIGN = 'MODULO_ASSIGN',     // %=
  
  // 比较运算符
  EQUAL = 'EQUAL',         // ==
  NOT_EQUAL = 'NOT_EQUAL', // !=
  GREATER = 'GREATER',     // >
  LESS = 'LESS',           // <
  GREATER_EQUAL = 'GREATER_EQUAL', // >=
  LESS_EQUAL = 'LESS_EQUAL',       // <=
  
  // 逻辑运算符
  AND = 'AND',             // &&
  OR = 'OR',               // ||
  NOT = 'NOT',             // !
  
  // 符号
  LEFT_PAREN = 'LEFT_PAREN',   // (
  RIGHT_PAREN = 'RIGHT_PAREN', // )
  LEFT_BRACE = 'LEFT_BRACE',   // {
  RIGHT_BRACE = 'RIGHT_BRACE', // }
  SEMICOLON = 'SEMICOLON',     // ;
  QUESTION = 'QUESTION',       // ?
  COLON = 'COLON',            // :
  
  // 关键字
  IF = 'IF',
  ELSE = 'ELSE',
  WHILE = 'WHILE',
  
  // 特殊
  EOF = 'EOF',
  NEWLINE = 'NEWLINE',
}

/**
 * Token 接口
 */
export interface Token {
  type: TokenType;
  value: string;
  line: number;
  column: number;
}

/**
 * 变量类型
 */
export enum VariableType {
  NUMBER = 'NUMBER',
  STRING = 'STRING',
  DICE_EXPRESSION = 'DICE_EXPRESSION',
}

/**
 * 变量值接口
 */
export interface DicenicValue {
  type: VariableType;
  value: number | string;
}

/**
 * 抽象语法树节点类型
 */
export enum ASTNodeType {
  PROGRAM = 'PROGRAM',
  BLOCK = 'BLOCK',
  
  // 表达式
  BINARY_EXPRESSION = 'BINARY_EXPRESSION',
  UNARY_EXPRESSION = 'UNARY_EXPRESSION',
  TERNARY_EXPRESSION = 'TERNARY_EXPRESSION',
  ASSIGNMENT_EXPRESSION = 'ASSIGNMENT_EXPRESSION',
  
  // 字面量
  NUMBER_LITERAL = 'NUMBER_LITERAL',
  STRING_LITERAL = 'STRING_LITERAL',
  DICE_LITERAL = 'DICE_LITERAL',
  
  // 变量
  IDENTIFIER = 'IDENTIFIER',
  SPECIAL_VARIABLE = 'SPECIAL_VARIABLE',
  
  // 语句
  IF_STATEMENT = 'IF_STATEMENT',
  WHILE_STATEMENT = 'WHILE_STATEMENT',
  EXPRESSION_STATEMENT = 'EXPRESSION_STATEMENT',
}

/**
 * AST 节点基类
 */
export interface ASTNode {
  type: ASTNodeType;
  line: number;
  column: number;
}

/**
 * 程序节点
 */
export interface ProgramNode extends ASTNode {
  type: ASTNodeType.PROGRAM;
  body: ASTNode[];
}

/**
 * 代码块节点
 */
export interface BlockNode extends ASTNode {
  type: ASTNodeType.BLOCK;
  body: ASTNode[];
}

/**
 * 二元表达式节点
 */
export interface BinaryExpressionNode extends ASTNode {
  type: ASTNodeType.BINARY_EXPRESSION;
  left: ASTNode;
  operator: TokenType;
  right: ASTNode;
}

/**
 * 一元表达式节点
 */
export interface UnaryExpressionNode extends ASTNode {
  type: ASTNodeType.UNARY_EXPRESSION;
  operator: TokenType;
  operand: ASTNode;
}

/**
 * 三元表达式节点
 */
export interface TernaryExpressionNode extends ASTNode {
  type: ASTNodeType.TERNARY_EXPRESSION;
  test: ASTNode;
  consequent: ASTNode;
  alternate: ASTNode;
}

/**
 * 赋值表达式节点
 */
export interface AssignmentExpressionNode extends ASTNode {
  type: ASTNodeType.ASSIGNMENT_EXPRESSION;
  left: ASTNode;
  operator: TokenType;
  right: ASTNode;
}

/**
 * 数字字面量节点
 */
export interface NumberLiteralNode extends ASTNode {
  type: ASTNodeType.NUMBER_LITERAL;
  value: number;
}

/**
 * 字符串字面量节点
 */
export interface StringLiteralNode extends ASTNode {
  type: ASTNodeType.STRING_LITERAL;
  value: string;
}

/**
 * 掷骰字面量节点
 */
export interface DiceLiteralNode extends ASTNode {
  type: ASTNodeType.DICE_LITERAL;
  count: number;
  sides: number;
}

/**
 * 标识符节点
 */
export interface IdentifierNode extends ASTNode {
  type: ASTNodeType.IDENTIFIER;
  name: string;
}

/**
 * 特殊变量节点
 */
export interface SpecialVariableNode extends ASTNode {
  type: ASTNodeType.SPECIAL_VARIABLE;
  prefix: string; // $a, $r, $s, $d
  name: string;
}

/**
 * if 语句节点
 */
export interface IfStatementNode extends ASTNode {
  type: ASTNodeType.IF_STATEMENT;
  test: ASTNode;
  consequent: ASTNode;
  alternate?: ASTNode;
}

/**
 * while 语句节点
 */
export interface WhileStatementNode extends ASTNode {
  type: ASTNodeType.WHILE_STATEMENT;
  test: ASTNode;
  body: ASTNode;
}

/**
 * 表达式语句节点
 */
export interface ExpressionStatementNode extends ASTNode {
  type: ASTNodeType.EXPRESSION_STATEMENT;
  expression: ASTNode;
}

/**
 * 执行上下文接口
 */
export interface ExecutionContext {
  // 角色卡属性（可读写）
  attributes: Map<string, DicenicValue>;
  
  // 角色信息（只读）
  roleInfo: Map<string, DicenicValue>;
  
  // 系统信息（只读）
  systemInfo: Map<string, DicenicValue>;
  
  // 骰娘信息（可读写）
  diceInfo: Map<string, DicenicValue>;
  
  // 局部变量
  variables: Map<string, DicenicValue>;
}
