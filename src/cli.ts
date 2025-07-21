import { Command } from 'commander'
import { container } from 'tsyringe'
import { ProcessManager } from './process-manager.js'

const program = new Command()

program
  .name('devctl')
  .description('简单的 npm dev 命令后台管理工具')
  .version('1.0.0')

program
  .command('start')
  .description('后台启动 npm run dev')
  .action(async () => {
    try {
      const processManager = container.resolve(ProcessManager)
      await processManager.start()
    } catch (error) {
      console.error('❌ 启动失败:', error)
      process.exit(1)
    }
  })

program
  .command('stop')
  .description('停止开发服务器')
  .action(async () => {
    try {
      const processManager = container.resolve(ProcessManager)
      await processManager.stop()
    } catch (error) {
      console.error('❌ 停止失败:', error)
      process.exit(1)
    }
  })

program
  .command('restart')
  .description('重启开发服务器')
  .action(async () => {
    try {
      const processManager = container.resolve(ProcessManager)
      await processManager.restart()
    } catch (error) {
      console.error('❌ 重启失败:', error)
      process.exit(1)
    }
  })

program
  .command('status')
  .description('查看服务器运行状态')
  .action(async () => {
    try {
      const processManager = container.resolve(ProcessManager)
      await processManager.status()
    } catch (error) {
      console.error('❌ 查看状态失败:', error)
      process.exit(1)
    }
  })

program
  .command('logs')
  .description('查看实时日志')
  .action(async () => {
    try {
      const processManager = container.resolve(ProcessManager)
      await processManager.showLogs()
    } catch (error) {
      console.error('❌ 查看日志失败:', error)
      process.exit(1)
    }
  })

export function run(): void {
  program.parse()
}