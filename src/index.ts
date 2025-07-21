#!/usr/bin/env node

import 'reflect-metadata'
import { setupProductionContainer } from './container.js'
import { run } from './cli.js'

// 初始化依赖注入容器
setupProductionContainer()

// 处理未捕获的异常
process.on('uncaughtException', (error) => {
  console.error('❌ 未捕获的异常:', error)
  process.exit(1)
})

process.on('unhandledRejection', (reason) => {
  console.error('❌ 未处理的Promise拒绝:', reason)
  process.exit(1)
})

// 运行CLI
run()
