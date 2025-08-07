/**
 * 错误处理模块导出
 */

// 错误类
export {
  DicenicError,
  SyntaxError,
  RuntimeError,
  TypeConversionError,
  VariableAccessError,
  DiceError,
  LoopError
} from './DicenicError';

// 错误处理器
export {
  ErrorHandler,
  ErrorHandlerConfig,
  DEFAULT_ERROR_CONFIG
} from './ErrorHandler';