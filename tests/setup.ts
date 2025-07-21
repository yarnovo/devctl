import 'reflect-metadata'
import { beforeEach } from 'vitest'
import { container } from 'tsyringe'
import { vol, type NestedDirectoryJSON } from 'memfs'
import {
  IFileSystem,
  FILE_SYSTEM_TOKEN,
} from '../src/interfaces/file-system.interface.js'
import { MemoryFileSystem } from '../src/infrastructure/memory-file-system.js'
import { FileService } from '../src/services/file-service.js'
import { ProcessManager } from '../src/process-manager.js'

// 设置测试容器
export function setupTestContainer(): void {
  // 清空容器
  container.clearInstances()

  // 注册内存文件系统用于测试
  container.registerSingleton<IFileSystem>(FILE_SYSTEM_TOKEN, MemoryFileSystem)
  container.registerSingleton(FileService)
  container.registerSingleton(ProcessManager)
}

// 重置内存文件系统
export function resetMemoryFileSystem(): void {
  vol.reset()
}

// 创建虚拟文件系统
export function createVirtualFileSystem(
  files: Record<string, string>,
  cwd?: string
): void {
  vol.fromJSON(files, cwd)
}

// 创建嵌套虚拟文件系统
export function createNestedVirtualFileSystem(
  files: NestedDirectoryJSON,
  cwd?: string
): void {
  vol.fromNestedJSON(files, cwd)
}

// 在每个测试前重置
beforeEach(() => {
  setupTestContainer()
  resetMemoryFileSystem()
})
