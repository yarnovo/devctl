import { promises as fs } from 'fs'
import { join } from 'path'
import { DevctlConfig } from './types.js'

export function getConfig(): DevctlConfig {
  const logsDir = join(process.cwd(), 'logs')
  return {
    logsDir,
    logFile: join(logsDir, 'dev.log'),
    pidFile: join(logsDir, 'dev.pid'),
  }
}

export async function ensureLogsDir(logsDir: string): Promise<void> {
  try {
    await fs.access(logsDir)
  } catch {
    await fs.mkdir(logsDir, { recursive: true })
  }
}

export async function readPidFile(pidFile: string): Promise<number | null> {
  try {
    const content = await fs.readFile(pidFile, 'utf8')
    const pid = parseInt(content.trim(), 10)
    return isNaN(pid) ? null : pid
  } catch {
    return null
  }
}

export async function writePidFile(
  pidFile: string,
  pid: number
): Promise<void> {
  await fs.writeFile(pidFile, pid.toString(), 'utf8')
}

export async function removePidFile(pidFile: string): Promise<void> {
  try {
    await fs.unlink(pidFile)
  } catch {
    // 文件可能不存在，忽略错误
  }
}

export function isProcessRunning(pid: number): boolean {
  try {
    // 发送信号 0 来检查进程是否存在
    process.kill(pid, 0)
    return true
  } catch {
    return false
  }
}

export function formatUptime(startTime: Date): string {
  const now = new Date()
  const diffMs = now.getTime() - startTime.getTime()

  const hours = Math.floor(diffMs / (1000 * 60 * 60))
  const minutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60))
  const seconds = Math.floor((diffMs % (1000 * 60)) / 1000)

  return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`
}
