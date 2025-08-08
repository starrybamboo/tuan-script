grammar Dicenic;

// ========== 语法规则 (Parser Rules) ==========

// 程序入口点
program: statement* EOF;

// 语句定义
statement
    : ifStatement
    | whileStatement
    | expressionStatement
    | block
    ;

// if-else语句
ifStatement: 'if' '(' expression ')' statement ('else' statement)?;

// while循环语句
whileStatement: 'while' '(' expression ')' statement;

// 表达式语句
expressionStatement: expression;

// 代码块
block: '{' statement* '}';

// 表达式层次结构（按优先级从低到高）
expression
    : ternaryExpression
    ;

// 三元运算符 (最低优先级)
ternaryExpression
    : logicalOrExpression ('?' expression ':' expression)?
    ;

// 逻辑或运算符
logicalOrExpression
    : logicalAndExpression ('||' logicalAndExpression)*
    ;

// 逻辑与运算符
logicalAndExpression
    : equalityExpression ('&&' equalityExpression)*
    ;

// 相等性运算符
equalityExpression
    : relationalExpression (('==' | '!=') relationalExpression)*
    ;

// 关系运算符
relationalExpression
    : additiveExpression (('<' | '>' | '<=' | '>=') additiveExpression)*
    ;

// 加法和减法运算符
additiveExpression
    : multiplicativeExpression (('+' | '-') multiplicativeExpression)*
    ;

// 乘法、除法和取模运算符
multiplicativeExpression
    : unaryExpression (('*' | '/' | '%') unaryExpression)*
    ;

// 一元运算符
unaryExpression
    : ('!' | '-' | '+') unaryExpression
    | assignmentExpression
    ;

// 赋值表达式
assignmentExpression
    : postfixExpression (('=' | '+=' | '-=' | '*=' | '/=' | '%=') expression)?
    ;

// 后缀表达式
postfixExpression
    : primaryExpression
    ;

// 基本表达式
primaryExpression
    : numberLiteral
    | stringLiteral
    | diceExpression
    | specialVariable
    | identifier
    | '(' expression ')'
    ;

// 数字字面量
numberLiteral: NUMBER;

// 字符串字面量
stringLiteral: STRING;

// 掷骰表达式
diceExpression: DICE;

// 特殊变量
specialVariable: SPECIAL_VAR;

// 标识符
identifier: IDENTIFIER;

// ========== 词法规则 (Lexer Rules) ==========

// 数字：整数或小数
NUMBER: [0-9]+ ('.' [0-9]+)?;

// 掷骰表达式：整数d整数 (大小写不敏感)
DICE: [0-9]+ [dD] [0-9]+;

// 字符串：双引号或单引号包裹，支持转义字符
STRING: '"' (~["\r\n\\] | '\\' .)* '"' 
      | '\'' (~['\r\n\\] | '\\' .)* '\'';

// 关键字（必须在标识符之前定义）
IF: 'if';
ELSE: 'else';
WHILE: 'while';

// 特殊变量：$前缀 + [arsd] + 标识符
SPECIAL_VAR: '$' [arsd] [a-zA-Z_\u4e00-\u9fa5][a-zA-Z0-9_\u4e00-\u9fa5-]*;

// 标识符：支持中文字符和连字符
IDENTIFIER: [a-zA-Z_\u4e00-\u9fa5][a-zA-Z0-9_\u4e00-\u9fa5-]*;

// 运算符
ASSIGN: '=';
PLUS_ASSIGN: '+=';
MINUS_ASSIGN: '-=';
MULT_ASSIGN: '*=';
DIV_ASSIGN: '/=';
MOD_ASSIGN: '%=';

LOGICAL_OR: '||';
LOGICAL_AND: '&&';
LOGICAL_NOT: '!';

EQUAL: '==';
NOT_EQUAL: '!=';
LESS_THAN: '<';
GREATER_THAN: '>';
LESS_EQUAL: '<=';
GREATER_EQUAL: '>=';

PLUS: '+';
MINUS: '-';
MULTIPLY: '*';
DIVIDE: '/';
MODULO: '%';

QUESTION: '?';
COLON: ':';

// 分隔符
LPAREN: '(';
RPAREN: ')';
LBRACE: '{';
RBRACE: '}';
SEMICOLON: ';';



// 空白字符和注释
WS: [ \t\r\n]+ -> skip;

// 单行注释
LINE_COMMENT: '//' ~[\r\n]* -> skip;

// 多行注释
BLOCK_COMMENT: '/*' .*? '*/' -> skip;