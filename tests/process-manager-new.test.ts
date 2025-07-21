import { describe, it, expect, beforeEach, vi } from 'vitest'
import { container } from 'tsyringe'
import { ProcessManager } from '../src/process-manager.js'
import { FileService } from '../src/services/file-service.js'
import { MemoryFileSystem } from '../src/infrastructure/memory-file-system.js'
import { IFileSystem, FILE_SYSTEM_TOKEN } from '../src/interfaces/file-system.interface.js'
import { createVirtualFileSystem, createNestedVirtualFileSystem } from './setup.js'

// Mock child_process 模块
vi.mock('child_process', () => ({
  spawn: vi.fn(),
  exec: vi.fn()
}))

// Mock console.log
const consoleSpy = vi.spyOn(console, 'log').mockImplementation(() => {})

describe('ProcessManager', () => {
  let processManager: ProcessManager
  let fileService: FileService
  let memoryFs: MemoryFileSystem

  beforeEach(() => {
    fileService = container.resolve(FileService)
    memoryFs = container.resolve<IFileSystem>(FILE_SYSTEM_TOKEN) as MemoryFileSystem
    
    // Mock getConfig 方法返回测试用的配置
    vi.spyOn(fileService, 'getConfig').mockReturnValue({
      logsDir: '/project/logs',
      logFile: '/project/logs/dev.log',
      pidFile: '/project/logs/dev.pid'
    })
    
    processManager = container.resolve(ProcessManager)
    
    // 创建基本的项目结构
    createNestedVirtualFileSystem({
      '/project': {
        'package.json': JSON.stringify({
          name: 'test-project',
          scripts: {
            dev: 'node server.js'
          }
        }),
        logs: {}
      }
    })
    
    consoleSpy.mockClear()
  })

  describe('status', () => {
    it('当没有 PID 文件时应该返回未运行状态', async () => {
      const result = await processManager.status()
      
      expect(result.isRunning).toBe(false)
      expect(result.pid).toBe(0)
      expect(consoleSpy).toHaveBeenCalledWith('❌ 开发服务器未运行')
    })

    it('当 PID 文件存在但进程未运行时应该清理 PID 文件', async () => {
      const pidFile = '/project/logs/dev.pid'
      const invalidPid = 999999
      
      createVirtualFileSystem({
        [pidFile]: invalidPid.toString()
      })
      
      const result = await processManager.status()
      
      expect(result.isRunning).toBe(false)
      expect(result.pid).toBe(invalidPid)
      expect(consoleSpy).toHaveBeenCalledWith('❌ 开发服务器未运行')
      expect(consoleSpy).toHaveBeenCalledWith('🧹 清理无效的PID文件')
      expect(await memoryFs.exists(pidFile)).toBe(false)
    })

    it('当进程正在运行时应该返回正确状态', async () => {
      const pidFile = '/project/logs/dev.pid'
      const validPid = process.pid // 使用当前进程 PID
      
      createVirtualFileSystem({
        [pidFile]: validPid.toString()
      })
      
      const result = await processManager.status()
      
      expect(result.isRunning).toBe(true)
      expect(result.pid).toBe(validPid)
      expect(consoleSpy).toHaveBeenCalledWith('✅ 开发服务器正在运行')
      expect(consoleSpy).toHaveBeenCalledWith(`📝 进程ID: ${validPid}`)
    })
  })

  describe('showLogs', () => {
    it('当日志文件不存在时应该显示错误信息', async () => {
      await processManager.showLogs()
      
      expect(consoleSpy).toHaveBeenCalledWith('❌ 日志文件不存在')
      expect(consoleSpy).toHaveBeenCalledWith('💡 请先启动开发服务器: devctl start')
    })

    it('当日志文件存在时应该显示日志提示', async () => {
      const logFile = '/project/logs/dev.log'
      
      createVirtualFileSystem({
        [logFile]: 'Server started\nProcessing request...\n'
      })
      
      await processManager.showLogs()
      
      expect(consoleSpy).toHaveBeenCalledWith('📄 实时查看开发服务器日志 (Ctrl+C 退出):')
      expect(consoleSpy).toHaveBeenCalledWith('─'.repeat(50))
    })
  })

  describe('stop', () => {
    it('当没有进程运行时应该显示提示', async () => {
      await processManager.stop()
      
      expect(consoleSpy).toHaveBeenCalledWith('❌ 开发服务器未运行')
    })

    it('当 PID 文件存在但进程不运行时应该清理文件', async () => {
      const pidFile = '/project/logs/dev.pid'
      const invalidPid = 999999
      
      createVirtualFileSystem({
        [pidFile]: invalidPid.toString()
      })
      
      await processManager.stop()
      
      expect(consoleSpy).toHaveBeenCalledWith('❌ 进程已不存在，清理PID文件')
      expect(await memoryFs.exists(pidFile)).toBe(false)
    })
  })

  describe('restart', () => {
    it('应该调用 stop 然后 start', async () => {
      const stopSpy = vi.spyOn(processManager, 'stop').mockResolvedValue()
      const startSpy = vi.spyOn(processManager, 'start').mockResolvedValue()
      
      await processManager.restart()
      
      expect(stopSpy).toHaveBeenCalled()
      expect(startSpy).toHaveBeenCalled()
      expect(consoleSpy).toHaveBeenCalledWith('🔄 重启开发服务器...')
    })
  })
})