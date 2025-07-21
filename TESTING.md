# 测试文档

本项目采用多层次的测试策略，确保 devctl 工具的可靠性和稳定性。

## 测试框架

我们使用以下测试工具和框架：

- **测试框架**: [Vitest](https://vitest.dev/) - 快速、现代的测试框架
- **测试环境**: Node.js 环境
- **覆盖率工具**: @vitest/coverage-v8
- **模拟工具**: Vitest 内置的 vi.mock()

## 测试策略

### 1. 单元测试 (Unit Tests)

**目标**: 测试单个函数和模块的功能

**位置**: `tests/` 目录

**测试内容**:
- `utils.test.ts`: 工具函数测试
  - 配置获取函数
  - 文件操作函数（PID 文件读写、日志目录创建等）
  - 进程检测函数
  - 时间格式化函数

**特点**:
- 隔离测试，不依赖外部环境
- 使用模拟（mock）来隔离依赖
- 快速执行
- 高覆盖率要求

**运行命令**:
```bash
npm run test:unit
```

### 2. 集成测试 (Integration Tests)

**目标**: 测试多个模块协作的功能

**位置**: `tests/process-manager.test.ts`, `tests/integration.test.ts`

**测试内容**:
- ProcessManager 类的完整功能
- CLI 命令的集成测试
- 文件系统操作的集成测试
- 进程管理的集成测试

**特点**:
- 测试组件间的交互
- 使用临时文件系统
- 模拟部分外部依赖
- 验证业务流程

**运行命令**:
```bash
npm run test:integration
```

### 3. 端到端测试 (E2E Tests)

**目标**: 从用户角度测试完整的工作流程

**位置**: `e2e/` 目录

**测试内容**:
- 完整的 devctl 命令行工具测试
- 真实的 npm 项目环境测试
- 跨平台兼容性测试
- 实际的后台进程管理测试

**特点**:
- 模拟真实用户使用场景
- 在真实环境中运行
- 自动化测试脚本
- 验证最终用户体验

**运行命令**:
```bash
npm run test:e2e
```

## 测试目录结构

```
devctl/
├── tests/                    # 单元测试和集成测试
│   ├── utils.test.ts        # 工具函数单元测试
│   ├── process-manager.test.ts  # ProcessManager 集成测试
│   └── integration.test.ts  # 系统集成测试
├── e2e/                     # 端到端测试
│   ├── package.json         # 测试项目配置
│   ├── test-project/        # 模拟项目环境
│   └── tests/               # E2E 测试脚本
└── vitest.config.ts         # 测试配置文件
```

## 测试配置

### Vitest 配置

```typescript
export default defineConfig({
  test: {
    globals: true,           // 全局测试函数
    environment: 'node',     // Node.js 环境
    pool: 'forks',          // 使用进程池避免 worker 限制
    coverage: {
      provider: 'v8',       # V8 覆盖率提供者
      reporter: ['text', 'html', 'lcov'],
      exclude: [            # 覆盖率排除文件
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
```

## 模拟策略

### 1. 进程管理模拟

对于涉及真实进程操作的测试，我们使用以下策略：

```typescript
// 模拟 child_process
vi.mock('child_process', () => ({
  spawn: vi.fn(),
  exec: vi.fn()
}))
```

### 2. 文件系统模拟

使用临时目录进行文件系统操作测试：

```typescript
beforeEach(async () => {
  tempDir = join(tmpdir(), 'devctl-test-' + Date.now())
  await fs.mkdir(tempDir, { recursive: true })
  process.chdir(tempDir)
})
```

### 3. 控制台输出模拟

模拟 console.log 来验证输出信息：

```typescript
const consoleSpy = vi.spyOn(console, 'log').mockImplementation(() => {})
```

## 测试用例设计原则

### 1. AAA 模式
- **Arrange**: 准备测试数据和环境
- **Act**: 执行被测试的操作
- **Assert**: 验证结果

### 2. 边界测试
- 测试正常情况
- 测试边界条件
- 测试异常情况

### 3. 幂等性
- 测试可以重复运行
- 测试之间不互相影响
- 每个测试都有独立的环境

## 运行所有测试

### 完整测试套件
```bash
npm run test:all
```

### 分层测试
```bash
# 单元测试
npm run test:unit

# 集成测试  
npm run test:integration

# 端到端测试
npm run test:e2e
```

### 覆盖率测试
```bash
npm run test:coverage
```

### 监听模式
```bash
npm test
```

## 持续集成

测试在以下情况下自动运行：
- 代码提交前（pre-commit hook）
- 拉取请求创建时
- 主分支合并时
- 发布前构建时

## 测试最佳实践

### 1. 测试命名
- 使用描述性的测试名称
- 说明测试的场景和预期结果
- 使用 `should...when...` 格式

### 2. 测试隔离
- 每个测试独立运行
- 使用 beforeEach/afterEach 设置和清理
- 避免测试间的副作用

### 3. 断言清晰
- 一个测试验证一个行为
- 使用清晰的断言消息
- 提供足够的上下文信息

### 4. 模拟合理
- 只模拟必要的依赖
- 保持模拟的简单性
- 验证模拟的调用

## 调试测试

### 运行单个测试
```bash
npx vitest run tests/utils.test.ts
```

### 调试模式
```bash
npx vitest --inspect-brk tests/utils.test.ts
```

### 详细输出
```bash
npx vitest run --reporter=verbose
```

## 测试覆盖率目标

- **单元测试覆盖率**: >= 90%
- **集成测试覆盖率**: >= 80%
- **总体覆盖率**: >= 85%

## 故障排除

### 常见问题

1. **进程权限问题**
   - 确保测试运行环境有足够权限
   - 使用临时目录避免权限冲突

2. **异步测试超时**
   - 适当设置测试超时时间
   - 正确处理 Promise 和异步操作

3. **平台兼容性**
   - 在不同操作系统上测试
   - 处理路径分隔符差异

4. **清理不彻底**
   - 确保每个测试后正确清理资源
   - 避免临时文件泄漏