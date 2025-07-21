# devctl

🚀 一个强大的 npm 开发服务器后台管理工具

[![npm version](https://badge.fury.io/js/devctl.svg)](https://badge.fury.io/js/devctl)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![TypeScript](https://img.shields.io/badge/%3C%2F%3E-TypeScript-%230074c1.svg)](http://www.typescriptlang.org/)

## 📖 简介

devctl 是一个专为前端开发者设计的 npm 包，它可以将你的 `npm run dev` 命令置于后台运行，并提供一套完整的管理命令来控制和监控开发服务器。告别终端被开发服务器占用的烦恼，让你的开发流程更加高效！

### 🌟 特性

- 🔄 **后台运行**：将开发服务器置于后台，释放终端
- 📝 **日志管理**：自动记录和管理开发服务器日志
- ⚡ **快速控制**：简单的命令即可启动、停止、重启服务
- 📊 **状态监控**：实时查看服务器运行状态和资源使用情况
- 🛠️ **灵活配置**：支持多种配置方式和自定义参数
- 🎯 **跨平台**：支持 Windows、macOS 和 Linux
- 🔍 **实时日志**：支持实时查看和历史日志查询

## 🚀 快速开始

### 安装

```bash
# 全局安装（推荐）
npm install -g devctl

# 或者在项目中安装
npm install --save-dev devctl
```

### 基本使用

```bash
# 启动开发服务器（后台运行）
devctl start

# 查看服务器状态
devctl status

# 查看实时日志
devctl logs --follow

# 停止服务器
devctl stop

# 重启服务器
devctl restart
```

## 📚 详细使用指南

### 命令概览

| 命令 | 简写 | 描述 |
|------|------|------|
| `devctl start [options]` | `devctl s` | 启动开发服务器 |
| `devctl stop` | `devctl down` | 停止开发服务器 |
| `devctl restart` | `devctl r` | 重启开发服务器 |
| `devctl status` | `devctl ps` | 查看服务器状态 |
| `devctl logs [options]` | `devctl log` | 查看日志 |
| `devctl config <action>` | - | 配置管理 |

### 启动服务器

```bash
# 基本启动
devctl start

# 指定端口启动
devctl start --port 3000

# 指定环境启动
devctl start --env production

# 静默启动
devctl start --silent

# 使用自定义配置文件
devctl start --config ./my-devctl.config.js
```

### 查看状态

```bash
devctl status
```

输出示例：
```
✅ 开发服务器正在运行
🔗 访问地址: http://localhost:5173
📝 进程ID: 12345
📄 日志文件: /path/to/project/logs/dev.log
🕐 运行时间: 01:23:45
💾 内存使用: 85.2MB
```

### 日志管理

```bash
# 查看最新日志
devctl logs

# 实时跟随日志
devctl logs --follow

# 查看指定行数
devctl logs --lines 100

# 从指定时间开始查看
devctl logs --since "2024-01-01 10:00:00"

# 搜索关键词
devctl logs --grep "error"
```

### 配置管理

```bash
# 查看所有配置
devctl config list

# 获取特定配置
devctl config get port

# 设置配置
devctl config set port 3000

# 删除配置
devctl config delete port
```

## ⚙️ 配置

### 配置文件

devctl 支持多种配置方式，按优先级排序：

1. 命令行参数
2. 项目配置文件 (`devctl.config.js`)
3. 用户配置文件 (`~/.devctlrc`)
4. 默认配置

### 配置文件示例

创建 `devctl.config.js`：

```javascript
module.exports = {
  // 默认启动命令
  command: 'npm run dev',
  
  // 默认端口
  port: 3000,
  
  // 环境变量
  env: {
    NODE_ENV: 'development'
  },
  
  // 日志配置
  logs: {
    level: 'info',
    maxSize: '100MB',
    maxFiles: 5,
    directory: './logs'
  },
  
  // 自动重启配置
  watch: {
    files: ['package.json', 'vite.config.js'],
    ignore: ['node_modules/**']
  }
}
```

### 环境变量

```bash
# 设置默认端口
export DEVCTL_PORT=3000

# 设置日志级别
export DEVCTL_LOG_LEVEL=debug

# 设置配置文件路径
export DEVCTL_CONFIG_PATH=./custom-config.js
```

## 🎛️ API 参考

### 命令行选项

#### start 命令选项

| 选项 | 类型 | 默认值 | 描述 |
|------|------|--------|------|
| `--port <number>` | number | - | 指定端口号 |
| `--env <environment>` | string | - | 指定环境 |
| `--silent` | boolean | false | 静默模式 |
| `--verbose` | boolean | false | 详细输出 |
| `--config <path>` | string | - | 配置文件路径 |
| `--no-logs` | boolean | false | 禁用日志记录 |

#### logs 命令选项

| 选项 | 类型 | 默认值 | 描述 |
|------|------|--------|------|
| `--follow, -f` | boolean | false | 实时跟随日志 |
| `--lines, -n <number>` | number | 50 | 显示行数 |
| `--since <time>` | string | - | 从指定时间开始 |
| `--grep <pattern>` | string | - | 搜索模式 |
| `--level <level>` | string | - | 日志级别过滤 |

### 配置选项

| 配置项 | 类型 | 默认值 | 描述 |
|--------|------|--------|------|
| `command` | string | 'npm run dev' | 启动命令 |
| `port` | number | - | 默认端口 |
| `env` | object | {} | 环境变量 |
| `logs.level` | string | 'info' | 日志级别 |
| `logs.directory` | string | './logs' | 日志目录 |
| `logs.maxSize` | string | '100MB' | 最大日志文件大小 |
| `logs.maxFiles` | number | 5 | 最大日志文件数 |

## 🔧 高级用法

### 多项目管理

```bash
# 为项目设置别名
devctl config set projects.frontend /path/to/frontend
devctl config set projects.backend /path/to/backend

# 启动特定项目
devctl start --project frontend

# 查看所有项目状态
devctl status --all
```

### 钩子脚本

在配置文件中定义钩子：

```javascript
module.exports = {
  hooks: {
    beforeStart: './scripts/before-start.sh',
    afterStart: './scripts/after-start.sh',
    beforeStop: './scripts/before-stop.sh',
    afterStop: './scripts/after-stop.sh'
  }
}
```

### 自定义命令

```javascript
module.exports = {
  commands: {
    // 自定义启动命令
    start: 'yarn dev --host',
    
    // 带参数的命令
    build: 'npm run build -- --mode=development'
  }
}
```

## 🐛 故障排除

### 常见问题

#### 1. 端口被占用

```bash
Error: Port 3000 is already in use
```

**解决方案**：
- 使用 `--port` 指定其他端口
- 或设置配置 `devctl config set port 3001`

#### 2. 权限不足

```bash
Error: Permission denied
```

**解决方案**：
- 检查日志目录权限：`chmod 755 logs/`
- 或使用 `sudo` 运行（不推荐）

#### 3. 进程丢失

```bash
Warning: Process not found, cleaning up PID file
```

**解决方案**：
- 这是正常的自动清理行为
- 重新启动服务即可：`devctl start`

#### 4. 配置文件错误

```bash
Error: Invalid configuration file
```

**解决方案**：
- 检查配置文件语法
- 使用 `devctl config list` 验证配置

### 调试模式

```bash
# 启用调试模式
DEBUG=devctl* devctl start

# 或使用环境变量
export DEBUG=devctl*
devctl start
```

### 日志分析

```bash
# 查看错误日志
devctl logs --level error

# 查看最近的启动日志
devctl logs --grep "starting" --lines 10

# 导出日志
devctl logs > debug.log
```

## 🤝 贡献指南

我们欢迎所有形式的贡献！

### 开发环境设置

```bash
# 克隆仓库
git clone https://github.com/your-username/devctl.git
cd devctl

# 安装依赖
npm install

# 运行测试
npm test

# 构建项目
npm run build

# 链接到全局（用于测试）
npm link
```

### 提交规范

我们使用 [Conventional Commits](https://conventionalcommits.org/) 规范：

```bash
feat: 添加新功能
fix: 修复bug
docs: 更新文档
style: 代码格式调整
refactor: 代码重构
test: 添加测试
chore: 构建流程或辅助工具的变动
```

### 问题报告

请在 [GitHub Issues](https://github.com/your-username/devctl/issues) 中报告问题，并提供：

- 操作系统和版本
- Node.js 版本
- devctl 版本
- 完整的错误信息
- 复现步骤

## 📄 许可证

本项目采用 [MIT 许可证](LICENSE)。

## 🙏 致谢

- 感谢所有贡献者
- 灵感来源于 [PM2](https://pm2.keymetrics.io/) 和 [nodemon](https://nodemon.io/)

## 📞 联系我们

- GitHub: [https://github.com/your-username/devctl](https://github.com/your-username/devctl)
- 问题反馈: [GitHub Issues](https://github.com/your-username/devctl/issues)
- 邮箱: your-email@example.com

---

<div align="center">
Made with ❤️ by <a href="https://github.com/your-username">Your Name</a>
</div>