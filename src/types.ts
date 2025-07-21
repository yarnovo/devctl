export interface ProcessInfo {
  pid: number
  isRunning: boolean
  startTime?: Date
  uptime?: string
}

export interface DevctlConfig {
  logsDir: string
  logFile: string
  pidFile: string
}

export type CommandName = 'start' | 'stop' | 'restart' | 'status' | 'logs'