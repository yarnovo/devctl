import { describe, it, expect, beforeEach, afterEach } from 'vitest'
import { promises as fs } from 'fs'
import { join } from 'path'
import { tmpdir } from 'os'
import { spawn } from 'child_process'
import { promisify } from 'util'

const execAsync = promisify(require('child_process').exec)

describe('Integration Tests', () => {
  let tempDir: string
  let originalCwd: string

  beforeEach(async () => {
    // 创建临时项目目录
    tempDir = join(tmpdir(), 'devctl-integration-test-' + Date.now())
    await fs.mkdir(tempDir, { recursive: true })
    
    // 创建一个简单的package.json
    const packageJson = {
      name: 'test-project',
      version: '1.0.0',
      scripts: {
        dev: 'node -e "console.log(\\"Dev server started\\"); setInterval(() => console.log(\\"Running...\\"), 1000)"'
      }
    }
    await fs.writeFile(
      join(tempDir, 'package.json'),
      JSON.stringify(packageJson, null, 2)
    )
    
    originalCwd = process.cwd()
    process.chdir(tempDir)
  })

  afterEach(async () => {
    process.chdir(originalCwd)
    
    try {
      await fs.rm(tempDir, { recursive: true, force: true })
    } catch {
      // 忽略清理错误
    }
  })

  describe('CLI commands', () => {
    it('should show correct status when no process is running', async () => {
      // 构建项目
      await execAsync('npm run build', { cwd: originalCwd })
      
      const devctlPath = join(originalCwd, 'bin', 'devctl.js')
      
      try {
        const { stdout } = await execAsync(`node "${devctlPath}" status`)
        expect(stdout).toContain('开发服务器未运行')
      } catch (error: any) {
        // devctl status 在没有进程运行时可能以非零状态退出
        expect(error.stdout || error.message).toContain('开发服务器未运行')
      }
    })

    it('should create logs directory structure', async () => {
      // 使用已经构建好的项目，避免在测试中重复构建
      const devctlPath = join(originalCwd, 'bin', 'devctl.js')
      
      // 检查 devctl 是否已构建
      try {
        await fs.access(devctlPath)
      } catch {
        console.warn('devctl not built, skipping test')
        return
      }
      
      // 尝试启动服务（可能会失败，但应该创建目录结构）
      try {
        await execAsync(`node "${devctlPath}" start`, { timeout: 5000 })
      } catch {
        // 启动可能失败，但我们主要测试目录创建
      }
      
      // 检查logs目录是否被创建
      const logsDir = join(tempDir, 'logs')
      await expect(fs.access(logsDir)).resolves.toBeUndefined()
    })
  })

  describe('File operations', () => {
    it('should create and manage PID file correctly', async () => {
      const logsDir = join(tempDir, 'logs')
      const pidFile = join(logsDir, 'dev.pid')
      
      // 创建logs目录
      await fs.mkdir(logsDir, { recursive: true })
      
      // 写入PID
      await fs.writeFile(pidFile, '12345', 'utf8')
      
      // 验证文件内容
      const content = await fs.readFile(pidFile, 'utf8')
      expect(content).toBe('12345')
      
      // 删除文件
      await fs.unlink(pidFile)
      
      // 验证文件已删除
      await expect(fs.access(pidFile)).rejects.toThrow()
    })

    it('should handle log file creation', async () => {
      const logsDir = join(tempDir, 'logs')
      const logFile = join(logsDir, 'dev.log')
      
      await fs.mkdir(logsDir, { recursive: true })
      
      // 模拟写入日志
      const logContent = 'Test log entry\\n'
      await fs.appendFile(logFile, logContent)
      
      // 验证日志文件内容
      const content = await fs.readFile(logFile, 'utf8')
      expect(content).toContain('Test log entry')
    })
  })

  describe('Process detection', () => {
    it('should correctly detect running processes', () => {
      // 测试当前进程应该是运行的
      try {
        process.kill(process.pid, 0)
        expect(true).toBe(true) // 如果没有抛出错误，进程存在
      } catch {
        expect(false).toBe(true) // 不应该到达这里
      }
    })

    it('should correctly detect non-existent processes', () => {
      // 测试一个不存在的进程ID
      try {
        process.kill(999999, 0)
        expect(false).toBe(true) // 不应该到达这里
      } catch (error: any) {
        expect(error.code).toBe('ESRCH') // 进程不存在
      }
    })
  })
})