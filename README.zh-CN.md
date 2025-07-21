# devctl

[English](./README.md)

🚀 简单的 npm dev 命令后台管理工具

[![npm version](https://badge.fury.io/js/devctl.svg)](https://badge.fury.io/js/devctl)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![TypeScript](https://img.shields.io/badge/%3C%2F%3E-TypeScript-%230074c1.svg)](http://www.typescriptlang.org/)

## 📖 简介

devctl 是一个轻量级的命令行工具，可以将你的 `npm run dev` 命令置于后台运行，并提供简单的管理命令。让你在开发时不再被占用终端，同时自动记录开发服务器的日志输出。

### 🌟 特性

- 🔄 **后台运行**：将 `npm run dev` 置于后台，释放终端
- 📝 **日志记录**：自动将控制台输出重定向到日志文件（每次启动时清空日志）
- ⚡ **简单控制**：启动、停止、重启、查看状态
- 📊 **状态查询**：查看服务器运行状态和进程信息
- 🚫 **进程保护**：防止重复启动，提供清晰的错误提示
- 🎯 **跨平台**：支持 Windows、macOS 和 Linux
- 🔍 **日志查看**：支持实时日志跟踪
- 🧪 **代码质量**：集成 ESLint v9、Prettier、TypeScript 类型检查
- 🔐 **Git Hooks**：使用 Husky + lint-staged 确保代码质量

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
devctl logs

# 停止服务器
devctl stop

# 重启服务器
devctl restart
```

## 📚 命令说明

### 可用命令

| 命令             | 描述                   |
| ---------------- | ---------------------- |
| `devctl start`   | 后台启动 `npm run dev` |
| `devctl stop`    | 停止开发服务器         |
| `devctl restart` | 重启开发服务器         |
| `devctl status`  | 查看服务器运行状态     |
| `devctl logs`    | 查看实时日志           |

### 使用示例

启动开发服务器：

```bash
devctl start
```

输出示例：

```
🚀 正在启动开发服务器...
✅ 开发服务器已启动!
📝 进程ID: 12345
📄 日志文件: ./logs/dev.log
```

如果服务器已经在运行：

```
❌ 开发服务器已经在运行中! PID: 12345
💡 使用 'devctl stop' 停止服务器
```

查看状态：

```bash
devctl status
```

输出示例：

```
✅ 开发服务器正在运行
📝 进程ID: 12345
📄 日志文件: ./logs/dev.log
🕐 运行时间: 01:23:45
```

查看日志：

```bash
devctl logs
```

这会实时显示开发服务器的输出日志。

## 📁 文件结构

devctl 会在项目根目录创建一个 `logs` 文件夹：

```
logs/
├── dev.log          # 开发服务器日志
└── dev.pid          # 进程ID文件
```

- `dev.log`：记录 `npm run dev` 的所有控制台输出（每次启动时清空）
- `dev.pid`：存储当前运行的进程ID

## 🔧 工作原理

1. **启动时**：`devctl start` 执行 `npm run dev` 并将其置于后台
2. **进程检查**：检查是否已有服务器在运行，防止重复启动
3. **日志记录**：将所有控制台输出重定向到 `logs/dev.log` 文件（每次启动清空）
4. **进程管理**：将进程ID保存到 `logs/dev.pid` 文件
5. **状态查询**：通过检查进程ID来判断服务器是否还在运行
6. **停止服务**：通过进程ID来终止后台运行的开发服务器

## 🐛 常见问题

### 问题：端口被占用

如果你的开发服务器提示端口被占用，这是正常的，因为 devctl 不控制端口分配，它只是代理执行 `npm run dev` 命令。

### 问题：进程丢失

```bash
Warning: Process not found, cleaning up PID file
```

这是正常的清理行为，重新启动即可：

```bash
devctl start
```

### 问题：权限不足

确保对项目目录有写权限，以便创建 `logs` 文件夹。

## 💻 开发

### 本地开发

```bash
# 克隆项目
git clone <repository-url>
cd devctl

# 安装依赖
npm install

# 构建项目
npm run build

# 链接到全局（用于测试）
npm link
```

### 开发脚本

```bash
# 运行所有检查（推荐在提交前运行）
npm run check

# 单独运行各项检查
npm run typecheck  # TypeScript 类型检查
npm run lint       # ESLint 代码检查
npm run test       # 运行测试

# 代码格式化
npm run format     # 格式化所有代码
npm run format:check  # 检查格式化状态

# 修复 ESLint 问题
npm run lint:fix
```

### 提交代码

本项目使用 Husky + lint-staged 确保代码质量。提交代码时会自动：

1. 格式化暂存的文件（使用 Prettier）
2. 运行 ESLint 检查并自动修复
3. 只有通过所有检查才能提交

```bash
# 添加文件到暂存区
git add .

# 提交（会自动触发检查）
git commit -m "feat: 添加新功能"
```

## 📄 许可证

本项目采用 [MIT 许可证](LICENSE)。
