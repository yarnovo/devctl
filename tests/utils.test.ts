import { describe, it, expect, beforeEach, afterEach } from 'vitest'
import { promises as fs } from 'fs'
import { join } from 'path'
import { tmpdir } from 'os'
import { 
  getConfig, 
  ensureLogsDir, 
  readPidFile, 
  writePidFile, 
  removePidFile,
  isProcessRunning,
  formatUptime
} from '../src/utils.js'

describe('utils', () => {
  let tempDir: string
  let originalCwd: string

  beforeEach(async () => {
    // 创建临时目录
    tempDir = join(tmpdir(), 'devctl-test-' + Date.now())
    await fs.mkdir(tempDir, { recursive: true })
    
    // 改变工作目录到临时目录
    originalCwd = process.cwd()
    process.chdir(tempDir)
  })

  afterEach(async () => {
    // 恢复工作目录
    process.chdir(originalCwd)
    
    // 清理临时目录
    try {
      await fs.rm(tempDir, { recursive: true, force: true })
    } catch {
      // 忽略清理错误
    }
  })

  describe('getConfig', () => {
    it('should return correct config paths', () => {
      const config = getConfig()
      
      expect(config.logsDir).toBe(join(tempDir, 'logs'))
      expect(config.logFile).toBe(join(tempDir, 'logs', 'dev.log'))
      expect(config.pidFile).toBe(join(tempDir, 'logs', 'dev.pid'))
    })
  })

  describe('ensureLogsDir', () => {
    it('should create logs directory if it does not exist', async () => {
      const logsDir = join(tempDir, 'logs')
      
      // 确认目录不存在
      await expect(fs.access(logsDir)).rejects.toThrow()
      
      await ensureLogsDir(logsDir)
      
      // 确认目录已创建
      await expect(fs.access(logsDir)).resolves.toBeUndefined()
    })

    it('should not throw if directory already exists', async () => {
      const logsDir = join(tempDir, 'logs')
      await fs.mkdir(logsDir)
      
      await expect(ensureLogsDir(logsDir)).resolves.toBeUndefined()
    })
  })

  describe('PID file operations', () => {
    let pidFile: string

    beforeEach(() => {
      pidFile = join(tempDir, 'test.pid')
    })

    describe('writePidFile and readPidFile', () => {
      it('should write and read PID correctly', async () => {
        const testPid = 12345
        
        await writePidFile(pidFile, testPid)
        const readPid = await readPidFile(pidFile)
        
        expect(readPid).toBe(testPid)
      })

      it('should return null if PID file does not exist', async () => {
        const readPid = await readPidFile(pidFile)
        expect(readPid).toBeNull()
      })

      it('should return null if PID file contains invalid content', async () => {
        await fs.writeFile(pidFile, 'invalid-pid', 'utf8')
        const readPid = await readPidFile(pidFile)
        expect(readPid).toBeNull()
      })
    })

    describe('removePidFile', () => {
      it('should remove existing PID file', async () => {
        await writePidFile(pidFile, 12345)
        await removePidFile(pidFile)
        
        await expect(fs.access(pidFile)).rejects.toThrow()
      })

      it('should not throw if PID file does not exist', async () => {
        await expect(removePidFile(pidFile)).resolves.toBeUndefined()
      })
    })
  })

  describe('isProcessRunning', () => {
    it('should return true for current process', () => {
      const isRunning = isProcessRunning(process.pid)
      expect(isRunning).toBe(true)
    })

    it('should return false for non-existent process', () => {
      // 使用一个很大的PID，应该不存在
      const isRunning = isProcessRunning(999999)
      expect(isRunning).toBe(false)
    })
  })

  describe('formatUptime', () => {
    it('should format uptime correctly', () => {
      const startTime = new Date('2024-01-01T10:00:00Z')
      
      // 模拟 formatUptime 函数内部的 new Date() 调用
      const originalDateConstructor = global.Date
      global.Date = class extends originalDateConstructor {
        constructor(...args: any[]) {
          if (args.length === 0) {
            return new originalDateConstructor('2024-01-01T11:23:45Z')
          }
          return new originalDateConstructor(...args)
        }
      } as any
      
      const uptime = formatUptime(startTime)
      expect(uptime).toBe('01:23:45')
      
      // 恢复原始 Date 构造函数
      global.Date = originalDateConstructor
    })

    it('should handle times less than an hour', () => {
      const startTime = new Date('2024-01-01T10:00:00Z')
      
      const originalDateConstructor = global.Date
      global.Date = class extends originalDateConstructor {
        constructor(...args: any[]) {
          if (args.length === 0) {
            return new originalDateConstructor('2024-01-01T10:05:30Z')
          }
          return new originalDateConstructor(...args)
        }
      } as any
      
      const uptime = formatUptime(startTime)
      expect(uptime).toBe('00:05:30')
      
      global.Date = originalDateConstructor
    })
  })
})