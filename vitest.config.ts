import { defineConfig } from 'vitest/config'

export default defineConfig({
  test: {
    globals: true,
    environment: 'node',
    pool: 'forks', // 解决 worker 中 process.chdir 的问题
    testTimeout: 10000, // 增加测试超时时间
    setupFiles: ['./tests/setup.ts'], // 设置测试初始化文件
    // 排除 e2e 测试，避免与单元测试同时运行
    exclude: ['**/node_modules/**', '**/dist/**', '**/tests/e2e.test.ts'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'html', 'lcov'],
      exclude: [
        'node_modules/',
        'dist/',
        'tests/',
        'e2e/',
        '*.config.*',
        'bin/'
      ]
    }
  }
})