import { describe, it, expect, beforeAll, afterAll, beforeEach, vi } from 'vitest'
import { spawn, ChildProcess } from 'child_process'
import { promises as fs } from 'fs'
import { join, dirname } from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

// 测试配置
const TEST_PROJECT_DIR = join(__dirname, '..', 'test-project')
const DEVCTL_BIN = join(__dirname, '..', '..', 'bin', 'devctl.js')
const LOGS_DIR = join(TEST_PROJECT_DIR, 'logs')
const LOG_FILE = join(LOGS_DIR, 'dev.log')
const PID_FILE = join(LOGS_DIR, 'dev.pid')

// 辅助函数：执行命令并返回结果
function execCommand(command: string, args: string[] = [], options = {}): Promise<{
  code: number | null
  stdout: string
  stderr: string
}> {
  return new Promise((resolve) => {
    const child = spawn(command, args, {
      cwd: TEST_PROJECT_DIR,
      stdio: 'pipe',
      ...options
    })

    let stdout = ''
    let stderr = ''

    child.stdout?.on('data', (data) => {
      stdout += data.toString()
    })

    child.stderr?.on('data', (data) => {
      stderr += data.toString()
    })

    child.on('close', (code) => {
      resolve({
        code,
        stdout: stdout.trim(),
        stderr: stderr.trim()
      })
    })
  })
}

// 辅助函数：等待
function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms))
}

// 辅助函数：检查文件是否存在
async function fileExists(path: string): Promise<boolean> {
  try {
    await fs.access(path)
    return true
  } catch {
    return false
  }
}

// 辅助函数：读取文件内容
async function readFile(path: string): Promise<string> {
  try {
    return await fs.readFile(path, 'utf8')
  } catch {
    return ''
  }
}

// 清理测试环境
async function cleanup() {
  try {
    // 停止可能运行的进程
    await execCommand('node', [DEVCTL_BIN, 'stop'])
    
    // 删除日志目录
    await fs.rm(LOGS_DIR, { recursive: true, force: true })
  } catch (error) {
    // 忽略清理错误
  }
}

describe('devctl E2E Tests', () => {
  // 设置较长的超时时间，因为 e2e 测试需要启动和停止进程
  vi.setConfig({ testTimeout: 30000, hookTimeout: 30000 })
  beforeAll(async () => {
    // 确保 devctl 二进制文件存在
    const binExists = await fileExists(DEVCTL_BIN)
    if (!binExists) {
      throw new Error('devctl 二进制文件不存在，请先构建项目 (npm run build)')
    }
  })

  beforeEach(async () => {
    // 清理环境
    await cleanup()
  })

  afterAll(async () => {
    // 最终清理
    await cleanup()
  })

  describe('status command', () => {
    it('should show server is not running when stopped', async () => {
      const result = await execCommand('node', [DEVCTL_BIN, 'status'])
      
      expect(result.code).toBe(0)
      expect(result.stdout).toContain('开发服务器未运行')
    })
  })

  describe('start command', () => {
    it('should successfully start the dev server', async () => {
      const result = await execCommand('node', [DEVCTL_BIN, 'start'])
      
      expect(result.code).toBe(0)
      expect(result.stdout).toContain('开发服务器已启动')
      expect(result.stdout).toContain('进程ID')
      
      // 等待服务启动
      await sleep(3000)
      
      // 检查文件是否创建
      expect(await fileExists(PID_FILE)).toBe(true)
      expect(await fileExists(LOG_FILE)).toBe(true)
      
      // 检查日志内容
      const logContent = await readFile(LOG_FILE)
      expect(logContent).toContain('Dev server started at http://localhost:3000')
    })

    it('should prevent duplicate starts', async () => {
      // 先启动服务
      await execCommand('node', [DEVCTL_BIN, 'start'])
      await sleep(3000)
      
      // 尝试再次启动
      const result = await execCommand('node', [DEVCTL_BIN, 'start'])
      
      expect(result.stdout).toContain('已经在运行中')
      expect(result.stdout).toContain('devctl stop')
    })
  })

  describe('status command (running)', () => {
    beforeEach(async () => {
      // 启动服务器
      await execCommand('node', [DEVCTL_BIN, 'start'])
      await sleep(3000)
    })

    it('should show running status correctly', async () => {
      const result = await execCommand('node', [DEVCTL_BIN, 'status'])
      
      expect(result.code).toBe(0)
      expect(result.stdout).toContain('开发服务器正在运行')
      expect(result.stdout).toContain('进程ID')
      expect(result.stdout).toContain('运行时间')
    })
  })

  describe('logs command', () => {
    beforeEach(async () => {
      // 启动服务器
      await execCommand('node', [DEVCTL_BIN, 'start'])
      await sleep(3000)
    })

    it('should show real-time logs', async () => {
      // 启动日志查看命令，设置超时
      const child = spawn('node', [DEVCTL_BIN, 'logs'], {
        cwd: TEST_PROJECT_DIR,
        stdio: 'pipe'
      })
      
      let logOutput = ''
      child.stdout.on('data', (data) => {
        logOutput += data.toString()
      })
      
      // 等待一些输出后终止
      await sleep(3000)
      child.kill('SIGINT')
      
      await new Promise(resolve => {
        child.on('close', resolve)
      })
      
      expect(logOutput).toContain('实时查看开发服务器日志')
      expect(logOutput).toContain('Server heartbeat')
    })
  })

  describe('restart command', () => {
    beforeEach(async () => {
      // 启动服务器
      await execCommand('node', [DEVCTL_BIN, 'start'])
      await sleep(3000)
    })

    it('should restart the server with new PID', async () => {
      // 获取当前 PID
      const oldPidContent = await readFile(PID_FILE)
      
      const result = await execCommand('node', [DEVCTL_BIN, 'restart'])
      
      expect(result.code).toBe(0)
      expect(result.stdout).toContain('重启开发服务器')
      expect(result.stdout).toContain('开发服务器已启动')
      
      // 等待重启完成
      await sleep(3000)
      
      // 检查 PID 是否变化
      const newPidContent = await readFile(PID_FILE)
      expect(newPidContent).not.toBe(oldPidContent)
      
      // 检查日志中的重启记录
      const logContent = await readFile(LOG_FILE)
      expect(logContent).toContain('Dev server started at http://localhost:3000')
    })
  })

  describe('stop command', () => {
    beforeEach(async () => {
      // 启动服务器
      await execCommand('node', [DEVCTL_BIN, 'start'])
      await sleep(3000)
    })

    it('should successfully stop the server', async () => {
      const result = await execCommand('node', [DEVCTL_BIN, 'stop'])
      
      expect(result.code).toBe(0)
      expect(result.stdout).toContain('开发服务器已停止')
      
      // 等待进程完全停止
      await sleep(2000)
      
      // 检查 PID 文件是否被删除
      expect(await fileExists(PID_FILE)).toBe(false)
      
      // 检查停止后的状态
      const statusResult = await execCommand('node', [DEVCTL_BIN, 'status'])
      expect(statusResult.stdout).toContain('开发服务器未运行')
    })
  })

  describe('stop command (not running)', () => {
    it('should handle stopping non-existent server gracefully', async () => {
      const result = await execCommand('node', [DEVCTL_BIN, 'stop'])
      expect(result.stdout).toContain('开发服务器未运行')
    })
  })
})