# 更新日志

所有重要的更改都将记录在此文件中。

格式基于 [Keep a Changelog](https://keepachangelog.com/zh-CN/1.0.0/)，
并且本项目遵循 [语义化版本](https://semver.org/lang/zh-CN/)。

## [Unreleased]

## [0.1.0-dev.1] - 2025-07-21

### Changed

#### CI/CD 配置

- 添加 GitHub Actions 权限设置（contents: write, packages: write）
- 更换 GitHub Release Action 为 softprops/action-gh-release
- 支持自动生成发布说明（generate_release_notes: true）

#### 文档

- 将项目描述翻译为英文（A simple npm dev command background management tool）
- 更新部署文档支持更多预发布版本后缀（alpha, beta, rc, dev）

## [0.1.0-dev.0] - 2025-07-21

### Added

#### 核心功能

- 简单的 npm dev 命令后台管理工具
- 支持启动、停止、重启开发服务器
- 实时日志查看功能
- 进程状态检查
- 自动清理日志文件

#### 架构设计

- 使用依赖注入模式（tsyringe）
- 文件系统抽象层设计
- 支持内存文件系统和真实文件系统
- 完整的单元测试和集成测试覆盖

#### 开发工具

- TypeScript 开发
- Vitest 测试框架
- ESLint v9 代码规范
- Prettier 代码格式化
- Husky + lint-staged Git hooks

#### NPM 脚本

- `typecheck` 命令用于 TypeScript 类型检查
- `check` 命令一键运行类型检查、代码检查和测试
- `format` 和 `format:check` 命令用于代码格式化

[Unreleased]: https://github.com/yarnovo/devctl/compare/v0.1.0-dev.0...HEAD
[0.1.0-dev.0]: https://github.com/yarnovo/devctl/releases/tag/v0.1.0-dev.0
