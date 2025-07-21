import { defineConfig } from 'vitest/config'

export default defineConfig({
  test: {
    globals: true,
    environment: 'node',
    testTimeout: 60000, // e2e 测试需要更长时间
    hookTimeout: 30000, // hook 超时时间
    // 不使用文件并行，避免进程冲突
    pool: 'forks',
    poolOptions: {
      forks: {
        singleFork: true
      }
    },
    // 包含所有 e2e 测试文件
    include: ['e2e/tests/**/*.test.{ts,js}'],
    // 排除 node_modules
    exclude: ['**/node_modules/**']
  }
})