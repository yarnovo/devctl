import { spawn, exec } from 'child_process'
import { promisify } from 'util'
import fs from 'fs'
import { inject, injectable } from 'tsyringe'
import { ProcessInfo } from './types.js'
import { FileService } from './services/file-service.js'

const execAsync = promisify(exec)

@injectable()
export class ProcessManager {
  private config

  constructor(@inject(FileService) private fileService: FileService) {
    this.config = this.fileService.getConfig()
  }

  async start(): Promise<void> {
    // 检查是否已经在运行
    const existingPid = await this.fileService.readPidFile(this.config.pidFile)
    if (existingPid && this.fileService.isProcessRunning(existingPid)) {
      console.log(`❌ 开发服务器已经在运行中! PID: ${existingPid}`)
      console.log("💡 使用 'devctl stop' 停止服务器")
      return
    }

    // 确保日志目录存在
    await this.fileService.ensureLogsDir(this.config.logsDir)

    // 清理可能存在的无效PID文件
    if (existingPid) {
      await this.fileService.removePidFile(this.config.pidFile)
    }

    console.log('🚀 正在启动开发服务器...')

    try {
      // 检查 npm run dev 命令是否存在
      await execAsync('npm run dev --help')
    } catch {
      console.log('❌ npm run dev 命令不存在!')
      console.log('💡 请确保 package.json 中配置了 dev 脚本')
      return
    }

    // 启动开发服务器
    // 使用独立的文件描述符来写入日志，避免阻塞主进程
    const logFd = fs.openSync(this.config.logFile, 'a')

    const child = spawn('npm', ['run', 'dev'], {
      detached: true,
      stdio: ['ignore', logFd, logFd],
      cwd: process.cwd(),
    })

    // 关闭文件描述符
    fs.closeSync(logFd)

    // 保存PID
    await this.fileService.writePidFile(this.config.pidFile, child.pid!)

    // 创建日志文件头部信息
    const logHeader = [
      `=== devctl 开发服务器启动 ${new Date().toISOString()} ===`,
      `项目目录: ${process.cwd()}`,
      `进程ID: ${child.pid}`,
      '='.repeat(50),
      '',
    ].join('\n')

    // 写入日志头部（在子进程输出之前）
    fs.appendFileSync(this.config.logFile, logHeader)

    // 分离子进程，让它在后台运行
    child.unref()

    // 等待一下确保服务器启动
    await new Promise((resolve) => setTimeout(resolve, 2000))

    if (this.fileService.isProcessRunning(child.pid!)) {
      console.log('✅ 开发服务器已启动!')
      console.log(`📝 进程ID: ${child.pid}`)
      console.log(`📄 日志文件: ${this.config.logFile}`)
      console.log('')
      console.log('💡 使用命令:')
      console.log('   devctl stop    - 停止服务器')
      console.log('   devctl status  - 查看状态')
      console.log('   devctl logs    - 查看日志')
    } else {
      console.log('❌ 开发服务器启动失败!')
      console.log(`📄 请查看日志文件: ${this.config.logFile}`)
      await this.fileService.removePidFile(this.config.pidFile)
    }
  }

  async stop(): Promise<void> {
    const pid = await this.fileService.readPidFile(this.config.pidFile)

    if (!pid) {
      console.log('❌ 开发服务器未运行')
      return
    }

    if (!this.fileService.isProcessRunning(pid)) {
      console.log('❌ 进程已不存在，清理PID文件')
      await this.fileService.removePidFile(this.config.pidFile)
      return
    }

    console.log(`🛑 正在停止开发服务器 (PID: ${pid})...`)

    try {
      // 尝试优雅停止
      process.kill(pid, 'SIGTERM')

      // 等待进程结束
      let attempts = 0
      while (attempts < 10 && this.fileService.isProcessRunning(pid)) {
        await new Promise((resolve) => setTimeout(resolve, 1000))
        attempts++
      }

      // 如果仍未结束，强制杀死
      if (this.fileService.isProcessRunning(pid)) {
        console.log('⚠️  强制停止进程...')
        process.kill(pid, 'SIGKILL')
      }

      await this.fileService.removePidFile(this.config.pidFile)
      console.log('✅ 开发服务器已停止')

      // 记录停止日志
      const stopLog = `\n=== devctl 手动停止服务器 ${new Date().toISOString()} ===\n\n`
      try {
        await this.fileService.fs.appendFile(this.config.logFile, stopLog)
      } catch {}
    } catch (error) {
      console.log('❌ 停止服务器时出现错误:', error)
    }
  }

  async restart(): Promise<void> {
    console.log('🔄 重启开发服务器...')
    await this.stop()
    await new Promise((resolve) => setTimeout(resolve, 2000))
    await this.start()
  }

  async status(): Promise<ProcessInfo> {
    const pid = await this.fileService.readPidFile(this.config.pidFile)

    if (!pid) {
      console.log('❌ 开发服务器未运行')
      return { pid: 0, isRunning: false }
    }

    const isRunning = this.fileService.isProcessRunning(pid)

    if (!isRunning) {
      console.log('❌ 开发服务器未运行')
      console.log('🧹 清理无效的PID文件')
      await this.fileService.removePidFile(this.config.pidFile)
      return { pid, isRunning: false }
    }

    // 尝试获取进程启动时间（仅在Linux/macOS上可用）
    let startTime: Date | undefined
    let uptime: string | undefined

    try {
      if (process.platform !== 'win32') {
        const { stdout } = await execAsync(`ps -o lstart= -p ${pid}`)
        startTime = new Date(stdout.trim())
        uptime = this.fileService.formatUptime(startTime)
      }
    } catch {
      // 忽略错误，某些系统可能不支持
    }

    console.log('✅ 开发服务器正在运行')
    console.log(`📝 进程ID: ${pid}`)
    console.log(`📄 日志文件: ${this.config.logFile}`)
    if (uptime) {
      console.log(`🕐 运行时间: ${uptime}`)
    }

    return { pid, isRunning: true, startTime, uptime }
  }

  async showLogs(): Promise<void> {
    try {
      // 检查日志文件是否存在
      const logExists = await this.fileService.logExists(this.config.logFile)
      if (!logExists) {
        console.log('❌ 日志文件不存在')
        console.log('💡 请先启动开发服务器: devctl start')
        return
      }

      console.log('📄 实时查看开发服务器日志 (Ctrl+C 退出):')
      console.log('─'.repeat(50))

      // 实现类似 tail -f 的功能
      const { spawn } = await import('child_process')

      let tailCommand: string
      let tailArgs: string[]

      if (process.platform === 'win32') {
        // Windows 上使用 PowerShell 的 Get-Content -Tail
        tailCommand = 'powershell'
        tailArgs = [
          '-Command',
          `Get-Content -Path "${this.config.logFile}" -Wait -Tail 50`,
        ]
      } else {
        // Unix 系统使用 tail -f
        tailCommand = 'tail'
        tailArgs = ['-f', this.config.logFile]
      }

      const tail = spawn(tailCommand, tailArgs, {
        stdio: 'inherit',
      })

      // 处理中断信号
      process.on('SIGINT', () => {
        tail.kill()
        process.exit(0)
      })

      tail.on('error', (error) => {
        console.log('❌ 无法显示日志:', error.message)
        console.log('💡 请手动查看日志文件:', this.config.logFile)
      })
    } catch (error) {
      console.log('❌ 显示日志时出现错误:', error)
      console.log('💡 请手动查看日志文件:', this.config.logFile)
    }
  }
}
