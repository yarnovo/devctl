import 'reflect-metadata'
import { container } from 'tsyringe'
import {
  IFileSystem,
  FILE_SYSTEM_TOKEN,
} from './interfaces/file-system.interface.js'
import { RealFileSystem } from './infrastructure/real-file-system.js'
import { ProcessManager } from './process-manager.js'

// 注册生产环境的依赖
export function setupProductionContainer(): void {
  container.registerSingleton<IFileSystem>(FILE_SYSTEM_TOKEN, RealFileSystem)
  container.registerSingleton(ProcessManager)
}

// 导出容器用于测试
export { container }
