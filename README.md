# devctl

[中文文档](./README.zh-CN.md)

🚀 A simple background process manager for npm dev commands

[![npm version](https://badge.fury.io/js/devctl.svg)](https://badge.fury.io/js/devctl)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![TypeScript](https://img.shields.io/badge/%3C%2F%3E-TypeScript-%230074c1.svg)](http://www.typescriptlang.org/)

## 📖 Introduction

devctl is a lightweight command-line tool that runs your `npm run dev` command in the background and provides simple management commands. Free up your terminal during development while automatically logging all server output.

### 🌟 Features

- 🔄 **Background Running**: Run `npm run dev` in the background, freeing up your terminal
- 📝 **Log Recording**: Automatically redirect console output to log files
- ⚡ **Simple Control**: Start, stop, restart, and check status
- 📊 **Status Query**: View server running status and process information
- 🎯 **Cross-platform**: Supports Windows, macOS, and Linux
- 🔍 **Log Viewing**: Support for real-time log tracking
- 🧪 **Code Quality**: Integrated with ESLint v9, Prettier, TypeScript type checking
- 🔐 **Git Hooks**: Use Husky + lint-staged to ensure code quality

## 🚀 Quick Start

### Installation

```bash
# Global installation (recommended)
npm install -g devctl

# Or install in your project
npm install --save-dev devctl
```

### Basic Usage

```bash
# Start development server (in background)
devctl start

# Check server status
devctl status

# View real-time logs
devctl logs

# Stop server
devctl stop

# Restart server
devctl restart
```

## 📚 Command Reference

### Available Commands

| Command          | Description                       |
| ---------------- | --------------------------------- |
| `devctl start`   | Start `npm run dev` in background |
| `devctl stop`    | Stop the development server       |
| `devctl restart` | Restart the development server    |
| `devctl status`  | Check server running status       |
| `devctl logs`    | View real-time logs               |

### Usage Examples

Start development server:

```bash
devctl start
```

Example output:

```
🚀 Starting development server...
✅ Development server started!
📝 Process ID: 12345
📄 Log file: ./logs/dev.log
```

Check status:

```bash
devctl status
```

Example output:

```
✅ Development server is running
📝 Process ID: 12345
📄 Log file: ./logs/dev.log
🕐 Uptime: 01:23:45
```

View logs:

```bash
devctl logs
```

This will display real-time output from the development server.

## 📁 File Structure

devctl creates a `logs` folder in your project root:

```
logs/
├── dev.log          # Development server logs
└── dev.pid          # Process ID file
```

- `dev.log`: Records all console output from `npm run dev`
- `dev.pid`: Stores the current running process ID

## 🔧 How It Works

1. **On Start**: `devctl start` executes `npm run dev` and runs it in the background
2. **Log Recording**: Redirects all console output to `logs/dev.log` file
3. **Process Management**: Saves process ID to `logs/dev.pid` file
4. **Status Query**: Checks if the server is still running by verifying the process ID
5. **Stop Service**: Terminates the background development server using the process ID

## 🐛 Troubleshooting

### Issue: Port Already in Use

If your development server reports that the port is already in use, this is normal. devctl doesn't control port allocation; it only proxies the `npm run dev` command.

### Issue: Process Lost

```bash
Warning: Process not found, cleaning up PID file
```

This is normal cleanup behavior. Simply restart:

```bash
devctl start
```

### Issue: Permission Denied

Ensure you have write permissions in the project directory to create the `logs` folder.

## 💻 Development

### Local Development

```bash
# Clone the project
git clone <repository-url>
cd devctl

# Install dependencies
npm install

# Build project
npm run build

# Link globally (for testing)
npm link
```

### Development Scripts

```bash
# Run all checks (recommended before committing)
npm run check

# Run individual checks
npm run typecheck  # TypeScript type checking
npm run lint       # ESLint code checking
npm run test       # Run tests

# Code formatting
npm run format     # Format all code
npm run format:check  # Check formatting status

# Fix ESLint issues
npm run lint:fix
```

### Committing Code

This project uses Husky + lint-staged to ensure code quality. When committing code, it will automatically:

1. Format staged files (using Prettier)
2. Run ESLint checks and auto-fix
3. Only allow commits if all checks pass

```bash
# Add files to staging area
git add .

# Commit (will automatically trigger checks)
git commit -m "feat: add new feature"
```

## 📄 License

This project is licensed under the [MIT License](LICENSE).
