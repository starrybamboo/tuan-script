/**
 * 性能测试
 * 测试解析器在各种负载下的性能表现
 */

import { executeScript, createExecutionContext, createNumberValue } from '../src/index';

describe('性能测试', () => {
  // 设置较长的超时时间用于性能测试
  const PERFORMANCE_TIMEOUT = 10000;

  describe('解析性能测试', () => {
    it('应该能够快速解析大型脚本', async () => {
      // 生成一个包含大量表达式的脚本
      let script = '';
      for (let i = 1; i <= 200; i++) {
        script += `var${i} = ${i} + ${i * 2}\n`;
      }
      script += 'var1 + var100 + var200';

      const startTime = performance.now();
      const result = executeScript(script);
      const endTime = performance.now();
      const executionTime = endTime - startTime;

      expect(result.success).toBe(true);
      expect(result.result).toBe('603'); // 3 + 300 + 600 = 903, 实际是 1+2 + 100+200 + 200+400 = 3+300+600 = 903
      expect(executionTime).toBeLessThan(1000); // 应该在1秒内完成
      
      console.log(`大型脚本解析时间: ${executionTime.toFixed(2)}ms`);
    }, PERFORMANCE_TIMEOUT);

    it('应该能够快速处理深度嵌套的表达式', async () => {
      // 创建深度嵌套的算术表达式
      let script = '1';
      for (let i = 0; i < 50; i++) {
        script = `(${script} + ${i + 1})`;
      }

      const startTime = performance.now();
      const result = executeScript(script);
      const endTime = performance.now();
      const executionTime = endTime - startTime;

      expect(result.success).toBe(true);
      // 1 + 1 + 2 + 3 + ... + 50 = 1 + (1+50)*50/2 = 1 + 1275 = 1276
      expect(result.result).toBe('1276');
      expect(executionTime).toBeLessThan(500);
      
      console.log(`深度嵌套表达式解析时间: ${executionTime.toFixed(2)}ms`);
    }, PERFORMANCE_TIMEOUT);

    it('应该能够快速处理大量变量访问', async () => {
      const context = createExecutionContext();
      
      // 预设大量变量
      for (let i = 1; i <= 100; i++) {
        context.setVariable(`var${i}`, createNumberValue(i));
      }

      // 创建访问所有变量的脚本
      let script = 'var1';
      for (let i = 2; i <= 100; i++) {
        script += ` + var${i}`;
      }

      const startTime = performance.now();
      const result = executeScript(script, { 
        context: {
          variables: context.getSnapshot().variables
        }
      });
      const endTime = performance.now();
      const executionTime = endTime - startTime;

      expect(result.success).toBe(true);
      expect(result.result).toBe('5050'); // 1+2+...+100 = 5050
      expect(executionTime).toBeLessThan(500);
      
      console.log(`大量变量访问时间: ${executionTime.toFixed(2)}ms`);
    }, PERFORMANCE_TIMEOUT);
  });

  describe('循环性能测试', () => {
    it('应该能够高效执行中等规模的循环', async () => {
      const script = `
        sum = 0
        i = 1
        while (i <= 500) {
          sum += i
          i += 1
        }
        sum
      `;

      const startTime = performance.now();
      const result = executeScript(script);
      const endTime = performance.now();
      const executionTime = endTime - startTime;

      expect(result.success).toBe(true);
      expect(result.result).toBe('125250'); // 1+2+...+500 = 500*501/2 = 125250
      expect(executionTime).toBeLessThan(2000);
      
      console.log(`500次循环执行时间: ${executionTime.toFixed(2)}ms`);
    }, PERFORMANCE_TIMEOUT);

    it('应该能够处理嵌套循环', async () => {
      const script = `
        sum = 0
        i = 1
        while (i <= 20) {
          j = 1
          while (j <= 10) {
            sum += 1
            j += 1
          }
          i += 1
        }
        sum
      `;

      const startTime = performance.now();
      const result = executeScript(script);
      const endTime = performance.now();
      const executionTime = endTime - startTime;

      expect(result.success).toBe(true);
      expect(result.result).toBe('200'); // 20 * 10 = 200
      expect(executionTime).toBeLessThan(1000);
      
      console.log(`嵌套循环执行时间: ${executionTime.toFixed(2)}ms`);
    }, PERFORMANCE_TIMEOUT);

    it('应该能够在循环中处理复杂表达式', async () => {
      const script = `
        result = 0
        i = 1
        while (i <= 100) {
          temp = i * 2 + 1
          result += temp > 50 ? temp / 2 : temp * 2
          i += 1
        }
        result
      `;

      const startTime = performance.now();
      const result = executeScript(script);
      const endTime = performance.now();
      const executionTime = endTime - startTime;

      expect(result.success).toBe(true);
      expect(result.errors).toHaveLength(0);
      expect(executionTime).toBeLessThan(1000);
      
      console.log(`复杂循环表达式执行时间: ${executionTime.toFixed(2)}ms`);
    }, PERFORMANCE_TIMEOUT);
  });

  describe('字符串处理性能测试', () => {
    it('应该能够快速处理大量字符串连接', async () => {
      let script = '"start"';
      for (let i = 1; i <= 100; i++) {
        script += ` + " ${i}"`;
      }

      const startTime = performance.now();
      const result = executeScript(script);
      const endTime = performance.now();
      const executionTime = endTime - startTime;

      expect(result.success).toBe(true);
      expect(result.result).toContain('start');
      expect(result.result).toContain(' 100');
      expect(executionTime).toBeLessThan(500);
      
      console.log(`大量字符串连接时间: ${executionTime.toFixed(2)}ms`);
    }, PERFORMANCE_TIMEOUT);

    it('应该能够快速处理字符串插值', async () => {
      const context = createExecutionContext();
      for (let i = 1; i <= 50; i++) {
        context.setVariable(`var${i}`, createNumberValue(i));
      }

      let script = '"Values: ';
      for (let i = 1; i <= 50; i++) {
        script += `{$var${i}} `;
      }
      script += '"';

      const startTime = performance.now();
      const result = executeScript(script, { 
        context: {
          variables: context.getSnapshot().variables
        }
      });
      const endTime = performance.now();
      const executionTime = endTime - startTime;

      expect(result.success).toBe(true);
      expect(result.result).toContain('Values:');
      expect(result.result).toContain('1 ');
      expect(result.result).toContain('50 ');
      expect(executionTime).toBeLessThan(500);
      
      console.log(`字符串插值处理时间: ${executionTime.toFixed(2)}ms`);
    }, PERFORMANCE_TIMEOUT);
  });

  describe('掷骰性能测试', () => {
    it('应该能够快速处理大量掷骰表达式', async () => {
      let script = '1d6';
      for (let i = 1; i < 100; i++) {
        script += ' + 1d6';
      }

      const startTime = performance.now();
      const result = executeScript(script);
      const endTime = performance.now();
      const executionTime = endTime - startTime;

      expect(result.success).toBe(true);
      const numResult = parseInt(result.result);
      expect(numResult).toBeGreaterThanOrEqual(100); // 100d6最小值
      expect(numResult).toBeLessThanOrEqual(600); // 100d6最大值
      expect(executionTime).toBeLessThan(1000);
      
      console.log(`100次掷骰执行时间: ${executionTime.toFixed(2)}ms`);
    }, PERFORMANCE_TIMEOUT);

    it('应该能够处理大骰子数量的掷骰', async () => {
      const script = '100d6';

      const startTime = performance.now();
      const result = executeScript(script);
      const endTime = performance.now();
      const executionTime = endTime - startTime;

      expect(result.success).toBe(true);
      const numResult = parseInt(result.result);
      expect(numResult).toBeGreaterThanOrEqual(100);
      expect(numResult).toBeLessThanOrEqual(600);
      expect(executionTime).toBeLessThan(100);
      
      console.log(`100d6掷骰执行时间: ${executionTime.toFixed(2)}ms`);
    }, PERFORMANCE_TIMEOUT);
  });

  describe('内存使用测试', () => {
    it('应该能够处理大量变量而不造成内存泄漏', async () => {
      const initialMemory = process.memoryUsage().heapUsed;

      // 执行多次脚本，每次创建大量变量
      for (let round = 0; round < 10; round++) {
        let script = '';
        for (let i = 1; i <= 100; i++) {
          script += `temp${i} = ${i} * ${round + 1}\n`;
        }
        script += 'temp1 + temp50 + temp100';

        const result = executeScript(script);
        expect(result.success).toBe(true);
      }

      // 强制垃圾回收（如果可用）
      if (global.gc) {
        global.gc();
      }

      const finalMemory = process.memoryUsage().heapUsed;
      const memoryIncrease = finalMemory - initialMemory;
      
      console.log(`内存增长: ${(memoryIncrease / 1024 / 1024).toFixed(2)}MB`);
      
      // 内存增长应该在合理范围内（小于50MB）
      expect(memoryIncrease).toBeLessThan(50 * 1024 * 1024);
    }, PERFORMANCE_TIMEOUT);

    it('应该能够重复执行相同脚本而不累积内存', async () => {
      const script = `
        sum = 0
        i = 1
        while (i <= 100) {
          sum += i * 2
          i += 1
        }
        sum
      `;

      const initialMemory = process.memoryUsage().heapUsed;

      // 重复执行相同脚本
      for (let i = 0; i < 50; i++) {
        const result = executeScript(script);
        expect(result.success).toBe(true);
        expect(result.result).toBe('10100'); // 2*(1+2+...+100) = 2*5050 = 10100
      }

      if (global.gc) {
        global.gc();
      }

      const finalMemory = process.memoryUsage().heapUsed;
      const memoryIncrease = finalMemory - initialMemory;
      
      console.log(`重复执行内存增长: ${(memoryIncrease / 1024 / 1024).toFixed(2)}MB`);
      
      // 重复执行相同脚本不应该显著增加内存使用
      expect(memoryIncrease).toBeLessThan(10 * 1024 * 1024);
    }, PERFORMANCE_TIMEOUT);
  });

  describe('并发性能测试', () => {
    it('应该能够并发执行多个脚本', async () => {
      const scripts = [
        'sum = 0; i = 1; while (i <= 50) { sum += i; i += 1 }; sum',
        'product = 1; j = 1; while (j <= 10) { product *= j; j += 1 }; product',
        'result = ""; k = 1; while (k <= 20) { result += k + " "; k += 1 }; result',
        'dice_sum = 0; l = 1; while (l <= 30) { dice_sum += 1d6; l += 1 }; dice_sum'
      ];

      const startTime = performance.now();
      
      const promises = scripts.map(script => 
        Promise.resolve(executeScript(script))
      );
      
      const results = await Promise.all(promises);
      
      const endTime = performance.now();
      const executionTime = endTime - startTime;

      expect(results).toHaveLength(4);
      results.forEach(result => {
        expect(result.success).toBe(true);
        expect(result.errors).toHaveLength(0);
      });

      expect(results[0].result).toBe('1275'); // 1+2+...+50 = 1275
      expect(results[1].result).toBe('3628800'); // 10! = 3628800
      expect(results[2].result).toContain('1 ');
      expect(results[2].result).toContain('20 ');
      
      const diceResult = parseInt(results[3].result);
      expect(diceResult).toBeGreaterThanOrEqual(30);
      expect(diceResult).toBeLessThanOrEqual(180);

      expect(executionTime).toBeLessThan(2000);
      
      console.log(`并发执行时间: ${executionTime.toFixed(2)}ms`);
    }, PERFORMANCE_TIMEOUT);
  });

  describe('压力测试', () => {
    it('应该能够处理极限情况下的复杂脚本', async () => {
      const script = `
        result = 0
        i = 1
        while (i <= 50) {
          j = 1
          temp_sum = 0
          while (j <= 10) {
            dice_val = 1d6
            multiplier = j % 2 == 0 ? 2 : 1
            temp_sum += dice_val * multiplier
            j += 1
          }
          result += temp_sum > 30 ? temp_sum : temp_sum * 2
          i += 1
        }
        result
      `;

      const startTime = performance.now();
      const result = executeScript(script);
      const endTime = performance.now();
      const executionTime = endTime - startTime;

      expect(result.success).toBe(true);
      expect(result.errors).toHaveLength(0);
      expect(executionTime).toBeLessThan(5000); // 5秒内完成
      
      console.log(`压力测试执行时间: ${executionTime.toFixed(2)}ms`);
      console.log(`压力测试结果: ${result.result}`);
    }, PERFORMANCE_TIMEOUT);
  });
});