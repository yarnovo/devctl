# 文件系统测试解决方案调研报告

## 概述

在 Node.js/TypeScript 项目中，测试涉及文件系统操作的代码时，我们需要避免对真实文件系统的副作用，同时保证测试的可靠性和性能。本文档调研了社区中流行的文件系统测试解决方案。

## 问题分析

### 当前面临的挑战

1. **副作用问题**：测试不应该修改真实的文件系统
2. **测试隔离**：不同测试之间不应该相互影响
3. **性能考虑**：文件 I/O 操作较慢，影响测试执行速度
4. **权限问题**：在某些环境中可能没有文件写入权限
5. **测试复杂性**：需要创建和清理大量测试文件

## 解决方案对比

### 1. memfs（推荐）

**简介**：内存文件系统，完全兼容 Node.js fs API

**优点**：
- ✅ 完全兼容 Node.js fs API（包括 fs/promises）
- ✅ 支持复杂的目录结构创建（通过 JSON）
- ✅ 性能优秀（纯内存操作）
- ✅ 与其他库兼容良好（如 fs-extra）
- ✅ 不会破坏 require、logging 等 Node.js 功能
- ✅ 活跃维护，社区支持良好

**缺点**：
- ❌ 需要额外的依赖

**使用示例**：
```typescript
import { vol } from 'memfs'
import { vi } from 'vitest'

// 在 __mocks__/fs.js 中设置全局 mock
const { fs } = require('memfs')
module.exports = fs

// 在测试中使用
beforeEach(() => {
  vol.reset() // 重置文件系统状态
})

test('file operations', () => {
  // 创建虚拟文件系统结构
  vol.fromJSON({
    '/project/package.json': JSON.stringify({ name: 'test' }),
    '/project/src/index.js': 'console.log("hello")',
    '/project/logs/dev.log': 'log content'
  })
  
  // 正常使用 fs API
  const content = fs.readFileSync('/project/package.json', 'utf8')
})
```

### 2. mock-fs（不推荐）

**简介**：临时替换 Node.js 内置 fs 模块

**优点**：
- ✅ 易于设置
- ✅ 支持复杂的文件系统模拟

**缺点**：
- ❌ 会破坏 require、logging 和 native bindings
- ❌ 与一些现代 Node.js 功能不兼容
- ❌ 维护不够活跃
- ❌ 在某些环境下不稳定

### 3. 手动 Mock fs 方法

**简介**：直接 mock fs 模块的各个方法

**优点**：
- ✅ 无额外依赖
- ✅ 完全控制 mock 行为

**缺点**：
- ❌ 需要手动 mock 大量方法
- ❌ 维护成本高
- ❌ 容易出错或遗漏
- ❌ 难以模拟复杂的文件系统状态

## 架构设计方案

### 方案一：依赖注入 + 文件系统抽象（推荐）

通过依赖注入和接口抽象，实现更优雅的测试方案：

```typescript
// 定义文件系统接口
interface IFileSystem {
  readFile(path: string): Promise<string>
  writeFile(path: string, data: string): Promise<void>
  mkdir(path: string): Promise<void>
  exists(path: string): Promise<boolean>
}

// 真实文件系统实现
class RealFileSystem implements IFileSystem {
  async readFile(path: string): Promise<string> {
    return fs.promises.readFile(path, 'utf8')
  }
  // ... 其他方法
}

// 内存文件系统实现
class MemoryFileSystem implements IFileSystem {
  private files = new Map<string, string>()
  
  async readFile(path: string): Promise<string> {
    const content = this.files.get(path)
    if (!content) throw new Error('File not found')
    return content
  }
  
  async writeFile(path: string, data: string): Promise<void> {
    this.files.set(path, data)
  }
  // ... 其他方法
}

// 服务类使用依赖注入
class ProcessManager {
  constructor(private fileSystem: IFileSystem) {}
  
  async readPidFile(path: string): Promise<number> {
    try {
      const content = await this.fileSystem.readFile(path)
      return parseInt(content.trim())
    } catch {
      return 0
    }
  }
}

// 测试中使用
test('process manager with memory fs', async () => {
  const memFs = new MemoryFileSystem()
  const processManager = new ProcessManager(memFs)
  
  // 设置文件内容
  await memFs.writeFile('/logs/dev.pid', '12345')
  
  // 测试
  const pid = await processManager.readPidFile('/logs/dev.pid')
  expect(pid).toBe(12345)
})
```

### 方案二：直接使用 memfs

对于已有项目，可以直接使用 memfs 进行 mock：

```typescript
// vitest.config.ts
export default defineConfig({
  test: {
    setupFiles: ['./tests/setup.ts']
  }
})

// tests/setup.ts
import { vi } from 'vitest'

vi.mock('fs', async () => {
  const memfs = await vi.importActual('memfs')
  return {
    default: memfs.fs,
    ...memfs.fs
  }
})

vi.mock('fs/promises', async () => {
  const memfs = await vi.importActual('memfs')
  return memfs.fs.promises
})
```

## Vitest 集成最佳实践

### 1. 全局设置

```typescript
// __mocks__/fs.js
const { fs } = require('memfs')
module.exports = fs

// __mocks__/fs/promises.js  
const { fs } = require('memfs')
module.exports = fs.promises
```

### 2. 测试模板

```typescript
import { vol } from 'memfs'
import { beforeEach, afterEach, describe, test, expect } from 'vitest'

describe('File System Tests', () => {
  beforeEach(() => {
    vol.reset()
  })
  
  afterEach(() => {
    vol.reset() // 确保清理
  })
  
  test('complex directory structure', () => {
    vol.fromNestedJSON({
      '/project': {
        'package.json': '{"name": "test"}',
        src: {
          'index.ts': 'export default {}',
          utils: {
            'helper.ts': 'export function help() {}'
          }
        },
        logs: {
          'dev.log': 'server started',
          'dev.pid': '12345'
        }
      }
    })
    
    // 测试文件系统操作
    expect(vol.existsSync('/project/package.json')).toBe(true)
  })
})
```

### 3. TypeScript 配置

```json
// tsconfig.json
{
  "compilerOptions": {
    "types": ["vitest/globals", "node"],
    "moduleResolution": "node",
    "esModuleInterop": true
  }
}
```

## 推荐方案

### 对于新项目

1. **使用依赖注入 + 文件系统抽象**
   - 遵循 SOLID 原则
   - 更好的可测试性
   - 更清晰的架构

2. **DI 框架选择**：
   - `tsyringe`：轻量级，易于使用
   - `inversify`：功能丰富，企业级

### 对于现有项目

1. **直接使用 memfs**
   - 改动最小
   - 立即可用
   - 与现有代码兼容良好

## 实施计划

### 阶段 1：快速解决（当前项目）
1. 安装 memfs
2. 设置全局 mock
3. 重写现有测试

### 阶段 2：架构优化（后续迭代）
1. 定义文件系统接口
2. 实现依赖注入
3. 重构核心类

## 结论

**推荐使用 memfs** 作为文件系统测试的主要解决方案：

1. **性能优秀**：纯内存操作，测试速度快
2. **兼容性好**：完全兼容 Node.js fs API
3. **易于使用**：通过 JSON 创建复杂目录结构
4. **社区认可**：广泛使用，维护活跃
5. **可靠性高**：不会破坏 Node.js 其他功能

对于追求更好架构的项目，建议结合依赖注入模式，通过接口抽象文件系统操作，实现更优雅的测试和更好的代码组织。

## 参考资源

- [memfs - npm](https://www.npmjs.com/package/memfs)
- [Vitest Mocking Guide](https://vitest.dev/guide/mocking)
- [Testing filesystem in Node.js: Please use memfs](https://medium.com/nerd-for-tech/testing-in-node-js-easy-way-to-mock-filesystem-883b9f822ea4)
- [Mock fs with vitest and memfs](https://kschaul.com/til/2024/06/26/mock-fs-with-vitest-and-memfs/)
- [Clean Architecture with TypeScript](https://dev.to/evangunawan/clean-architecture-in-nodejs-an-approach-with-typescript-and-dependency-injection-16o)