#!/usr/bin/env node

/**
 * 模拟开发服务器
 * 用于测试 devctl 工具的端到端功能
 */

console.log('🚀 Dev server started at http://localhost:3000')
console.log('📅 Started at:', new Date().toISOString())

let counter = 0

// 模拟服务器日志输出
const logInterval = setInterval(() => {
  counter++
  console.log(`[${new Date().toISOString()}] Server heartbeat #${counter}`)
  
  // 模拟一些不同类型的日志
  if (counter % 3 === 0) {
    console.log(`[INFO] Processing request ${counter}`)
  }
  if (counter % 5 === 0) {
    console.error(`[WARN] Memory usage: ${Math.floor(Math.random() * 100)}MB`)
  }
  if (counter % 10 === 0) {
    console.log(`[DEBUG] Cache entries: ${Math.floor(Math.random() * 1000)}`)
  }
}, 2000)

// 处理进程终止信号
function gracefulShutdown(signal) {
  console.log(`\\n[INFO] Received ${signal}, shutting down gracefully...`)
  clearInterval(logInterval)
  
  setTimeout(() => {
    console.log('[INFO] Server stopped')
    process.exit(0)
  }, 1000)
}

// 监听终止信号
process.on('SIGTERM', () => gracefulShutdown('SIGTERM'))
process.on('SIGINT', () => gracefulShutdown('SIGINT'))

// 保持进程运行
process.stdin.resume()