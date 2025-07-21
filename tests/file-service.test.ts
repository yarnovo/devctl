import { describe, it, expect, beforeEach } from 'vitest'
import { container } from 'tsyringe'
import { FileService } from '../src/services/file-service.js'
import { MemoryFileSystem } from '../src/infrastructure/memory-file-system.js'
import { IFileSystem, FILE_SYSTEM_TOKEN } from '../src/interfaces/file-system.interface.js'
import { createVirtualFileSystem } from './setup.js'

describe('FileService', () => {
  let fileService: FileService
  let memoryFs: MemoryFileSystem

  beforeEach(() => {
    fileService = container.resolve(FileService)
    memoryFs = container.resolve<IFileSystem>(FILE_SYSTEM_TOKEN) as MemoryFileSystem
  })

  describe('配置管理', () => {
    it('应该返回正确的配置', () => {
      const config = fileService.getConfig()
      
      expect(config.logsDir).toContain('logs')
      expect(config.logFile).toContain('logs/dev.log')
      expect(config.pidFile).toContain('logs/dev.pid')
    })
  })

  describe('目录管理', () => {
    it('应该创建日志目录', async () => {
      const logsDir = '/project/logs'
      
      await fileService.ensureLogsDir(logsDir)
      
      expect(await memoryFs.exists(logsDir)).toBe(true)
    })

    it('如果目录已存在则不重复创建', async () => {
      const logsDir = '/project/logs'
      
      // 先创建目录
      createVirtualFileSystem({
        '/project/logs/': ''
      })
      
      // 再次确保目录存在应该不报错
      await expect(fileService.ensureLogsDir(logsDir)).resolves.not.toThrow()
    })
  })

  describe('PID 文件管理', () => {
    it('应该读取 PID 文件', async () => {
      const pidFile = '/project/logs/dev.pid'
      const expectedPid = 12345
      
      createVirtualFileSystem({
        [pidFile]: expectedPid.toString()
      })
      
      const pid = await fileService.readPidFile(pidFile)
      expect(pid).toBe(expectedPid)
    })

    it('当文件不存在时应该返回 null', async () => {
      const pidFile = '/project/logs/dev.pid'
      
      const pid = await fileService.readPidFile(pidFile)
      expect(pid).toBeNull()
    })

    it('当文件内容无效时应该返回 null', async () => {
      const pidFile = '/project/logs/dev.pid'
      
      createVirtualFileSystem({
        [pidFile]: 'invalid-pid'
      })
      
      const pid = await fileService.readPidFile(pidFile)
      expect(pid).toBeNull()
    })

    it('应该写入 PID 文件', async () => {
      const pidFile = '/project/logs/dev.pid'
      const pid = 54321
      
      // 先确保目录存在
      await fileService.ensureLogsDir('/project/logs')
      await fileService.writePidFile(pidFile, pid)
      
      const content = await memoryFs.readFile(pidFile)
      expect(content.trim()).toBe(pid.toString())
    })

    it('应该删除 PID 文件', async () => {
      const pidFile = '/project/logs/dev.pid'
      
      // 创建文件
      createVirtualFileSystem({
        [pidFile]: '12345'
      })
      
      expect(await memoryFs.exists(pidFile)).toBe(true)
      
      await fileService.removePidFile(pidFile)
      
      expect(await memoryFs.exists(pidFile)).toBe(false)
    })

    it('删除不存在的 PID 文件时不应该报错', async () => {
      const pidFile = '/project/logs/dev.pid'
      
      await expect(fileService.removePidFile(pidFile)).resolves.not.toThrow()
    })
  })

  describe('日志文件管理', () => {
    it('应该检查日志文件是否存在', async () => {
      const logFile = '/project/logs/dev.log'
      
      expect(await fileService.logExists(logFile)).toBe(false)
      
      createVirtualFileSystem({
        [logFile]: 'log content'
      })
      
      expect(await fileService.logExists(logFile)).toBe(true)
    })
  })

  describe('进程管理', () => {
    it('应该检查进程是否运行', () => {
      const currentPid = process.pid
      
      // 当前进程应该是运行的
      expect(fileService.isProcessRunning(currentPid)).toBe(true)
      
      // 不存在的进程应该返回 false
      expect(fileService.isProcessRunning(999999)).toBe(false)
    })
  })

  describe('时间格式化', () => {
    it('应该正确格式化运行时间', () => {
      const startTime = new Date(Date.now() - 3661000) // 1小时1分钟1秒前
      
      const uptime = fileService.formatUptime(startTime)
      
      expect(uptime).toMatch(/01:01:01/)
    })

    it('应该处理小于1分钟的时间', () => {
      const startTime = new Date(Date.now() - 30000) // 30秒前
      
      const uptime = fileService.formatUptime(startTime)
      
      expect(uptime).toMatch(/00:00:30/)
    })
  })
})