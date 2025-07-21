import { inject, injectable } from 'tsyringe'
import { join } from 'path'
import { DevctlConfig } from '../types.js'
import {
  IFileSystem,
  FILE_SYSTEM_TOKEN,
} from '../interfaces/file-system.interface.js'

@injectable()
export class FileService {
  constructor(@inject(FILE_SYSTEM_TOKEN) private fileSystem: IFileSystem) {}

  get fs(): IFileSystem {
    return this.fileSystem
  }

  getConfig(): DevctlConfig {
    const logsDir = join(process.cwd(), 'logs')
    return {
      logsDir,
      logFile: join(logsDir, 'dev.log'),
      pidFile: join(logsDir, 'dev.pid'),
    }
  }

  async ensureLogsDir(logsDir: string): Promise<void> {
    try {
      await this.fileSystem.access(logsDir)
    } catch {
      await this.fileSystem.mkdir(logsDir, { recursive: true })
    }
  }

  async readPidFile(pidFile: string): Promise<number | null> {
    try {
      const content = await this.fileSystem.readFile(pidFile)
      const pid = parseInt(content.trim(), 10)
      return isNaN(pid) ? null : pid
    } catch {
      return null
    }
  }

  async writePidFile(pidFile: string, pid: number): Promise<void> {
    await this.fileSystem.writeFile(pidFile, pid.toString())
  }

  async removePidFile(pidFile: string): Promise<void> {
    try {
      await this.fileSystem.unlink(pidFile)
    } catch {
      // 文件可能不存在，忽略错误
    }
  }

  async logExists(logFile: string): Promise<boolean> {
    return this.fileSystem.exists(logFile)
  }

  isProcessRunning(pid: number): boolean {
    try {
      // 发送信号 0 来检查进程是否存在
      process.kill(pid, 0)
      return true
    } catch {
      return false
    }
  }

  formatUptime(startTime: Date): string {
    const now = new Date()
    const diffMs = now.getTime() - startTime.getTime()

    const hours = Math.floor(diffMs / (1000 * 60 * 60))
    const minutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60))
    const seconds = Math.floor((diffMs % (1000 * 60)) / 1000)

    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`
  }
}
