#!/usr/bin/env node

// ESM 入口文件
import('../dist/index.js')
  .catch(error => {
    console.error('❌ 启动失败:', error)
    process.exit(1)
  })