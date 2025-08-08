#!/usr/bin/env node

/**
 * Dicenic脚本语言解析器命令行工具
 * 用于读取和执行Dicenic脚本文件
 */

import * as fs from 'fs';
import * as path from 'path';
import { executeScript, createStringValue, createNumberValue } from './index';

/**
 * 显示使用帮助
 */
function showHelp(): void {
  console.log(`
Dicenic脚本语言解析器

用法:
  npm run main <script-file> [options]
  
参数:
  script-file    要执行的Dicenic脚本文件路径

选项:
  --help, -h     显示此帮助信息
  --verbose, -v  显示详细输出（包括警告和错误）
  --context, -c  指定上下文JSON文件路径
  
示例:
  npm run main example.dice
  npm run main example.dice --verbose
  npm run main example.dice --context context.json
  
脚本示例:
  name = "勇者"
  level = 10
  hp = 100
  damage = 2d6 + level
  "角色 " + name + " 造成了 " + damage + " 点伤害"
`);
}

/**
 * 解析命令行参数
 */
function parseArgs(): {
  scriptFile?: string;
  verbose: boolean;
  contextFile?: string;
  showHelp: boolean;
} {
  const args = process.argv.slice(2);
  const result = {
    scriptFile: undefined as string | undefined,
    verbose: false,
    contextFile: undefined as string | undefined,
    showHelp: false
  };

  for (let i = 0; i < args.length; i++) {
    const arg = args[i];
    
    if (arg === '--help' || arg === '-h') {
      result.showHelp = true;
    } else if (arg === '--verbose' || arg === '-v') {
      result.verbose = true;
    } else if (arg === '--context' || arg === '-c') {
      if (i + 1 < args.length) {
        result.contextFile = args[++i];
      } else {
        console.error('错误: --context 选项需要指定文件路径');
        process.exit(1);
      }
    } else if (!result.scriptFile && !arg.startsWith('-')) {
      result.scriptFile = arg;
    } else {
      console.error(`错误: 未知选项 ${arg}`);
      process.exit(1);
    }
  }

  return result;
}

/**
 * 读取并解析上下文文件
 */
function loadContext(contextFile: string): any {
  try {
    const contextData = fs.readFileSync(contextFile, 'utf-8');
    const parsed = JSON.parse(contextData);
    
    // 转换为执行上下文格式
    const context: any = {};
    
    if (parsed.attributes) {
      context.attributes = new Map();
      for (const [key, value] of Object.entries(parsed.attributes)) {
        context.attributes.set(key, typeof value === 'number' ? 
          createNumberValue(value as number) : 
          createStringValue(String(value))
        );
      }
    }
    
    if (parsed.roleInfo) {
      context.roleInfo = new Map();
      for (const [key, value] of Object.entries(parsed.roleInfo)) {
        context.roleInfo.set(key, typeof value === 'number' ? 
          createNumberValue(value as number) : 
          createStringValue(String(value))
        );
      }
    }
    
    if (parsed.systemInfo) {
      context.systemInfo = new Map();
      for (const [key, value] of Object.entries(parsed.systemInfo)) {
        context.systemInfo.set(key, typeof value === 'number' ? 
          createNumberValue(value as number) : 
          createStringValue(String(value))
        );
      }
    }
    
    if (parsed.diceInfo) {
      context.diceInfo = new Map();
      for (const [key, value] of Object.entries(parsed.diceInfo)) {
        context.diceInfo.set(key, typeof value === 'number' ? 
          createNumberValue(value as number) : 
          createStringValue(String(value))
        );
      }
    }
    
    return context;
  } catch (error) {
    console.error(`错误: 无法读取上下文文件 ${contextFile}`);
    if (error instanceof Error) {
      console.error(`详细信息: ${error.message}`);
    }
    process.exit(1);
  }
}

/**
 * 主函数
 */
function main(): void {
  const args = parseArgs();
  
  if (args.showHelp) {
    showHelp();
    return;
  }
  
  if (!args.scriptFile) {
    console.error('错误: 请指定要执行的脚本文件');
    console.error('使用 --help 查看使用说明');
    process.exit(1);
  }
  
  // 检查脚本文件是否存在
  if (!fs.existsSync(args.scriptFile)) {
    console.error(`错误: 脚本文件 ${args.scriptFile} 不存在`);
    process.exit(1);
  }
  
  try {
    // 读取脚本文件
    const scriptContent = fs.readFileSync(args.scriptFile, 'utf-8');
    
    if (args.verbose) {
      console.log(`正在执行脚本: ${path.resolve(args.scriptFile)}`);
      console.log('脚本内容:');
      console.log('─'.repeat(50));
      console.log(scriptContent);
      console.log('─'.repeat(50));
    }
    
    // 加载上下文（如果指定）
    let context = undefined;
    if (args.contextFile) {
      context = loadContext(args.contextFile);
      if (args.verbose) {
        console.log(`已加载上下文文件: ${args.contextFile}`);
      }
    }
    
    // 执行脚本
    const startTime = Date.now();
    const result = executeScript(scriptContent, { 
      context,
      errorConfig: {
        enableRecovery: true,
        logWarnings: args.verbose
      }
    });
    const executionTime = Date.now() - startTime;
    
    // 输出结果
    if (result.success) {
      console.log('执行结果:');
      console.log(result.result);
      
      if (args.verbose) {
        console.log(`\n执行时间: ${executionTime}ms`);
        
        if (result.warnings.length > 0) {
          console.log('\n警告:');
          result.warnings.forEach((warning, index) => {
            console.log(`  ${index + 1}. ${warning}`);
          });
        }
      }
    } else {
      console.error('脚本执行失败:');
      result.errors.forEach((error, index) => {
        console.error(`  ${index + 1}. ${error}`);
      });
      
      if (args.verbose && result.warnings.length > 0) {
        console.log('\n警告:');
        result.warnings.forEach((warning, index) => {
          console.log(`  ${index + 1}. ${warning}`);
        });
      }
      
      process.exit(1);
    }
    
  } catch (error) {
    console.error(`错误: 无法读取脚本文件 ${args.scriptFile}`);
    if (error instanceof Error) {
      console.error(`详细信息: ${error.message}`);
    }
    process.exit(1);
  }
}

// 如果直接运行此文件，则执行main函数
if (require.main === module) {
  main();
}

export { main };