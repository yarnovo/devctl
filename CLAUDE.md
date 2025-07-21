# devctl 项目记忆

## 项目概述

devctl 是一个简单的 npm dev 命令后台管理工具，使用 TypeScript 开发，采用依赖注入架构。

## 技术栈

- **语言**: TypeScript (ESM modules)
- **依赖注入**: tsyringe
- **测试框架**: Vitest
- **代码规范**: ESLint + Prettier
- **构建工具**: TypeScript Compiler (tsc)

## CI/CD 配置

### GitHub Actions 工作流

项目使用 GitHub Actions 实现自动化 CI/CD，配置文件位于 `.github/workflows/ci-cd.yaml`。

#### CI 触发条件

- 推送到 main 分支
- 向 main 分支创建 PR
- 创建以 `v` 开头的标签

#### CD 触发条件

- 仅在创建以 `v` 开头的标签时触发（例如：v1.0.0）
- 自动发布到 npm 并创建 GitHub Release

### 必需的环境变量

1. **NPM_TOKEN**: npm 发布认证 token，需要在 GitHub Secrets 中配置
2. **GITHUB_TOKEN**: GitHub Actions 自动提供，用于创建 Release

### 发布流程

1. 运行 `npm run check` 确保所有检查通过
2. 使用 `npm version [patch|minor|major]` 更新版本
3. 更新 CHANGELOG.md
4. 推送代码和标签：`git push origin main --tags`
5. GitHub Actions 自动执行 CI/CD 流程

## 项目约定

### 代码风格

- 使用 TypeScript 严格模式
- 遵循 ESLint 和 Prettier 配置
- 使用依赖注入管理服务

### 测试策略

- 单元测试：使用 Vitest
- 集成测试：tests/integration.test.ts
- E2E 测试：使用独立的 vitest 配置

### 构建和发布

- 构建输出目录：dist/
- 发布文件：dist/, bin/, README.md, LICENSE
- 入口文件：bin/devctl.js (CLI) 和 dist/index.js (库)

### 关键变更

- 只使用 Node.js 20.x 进行测试
- 保留 `prepublishOnly` 钩子，确保发布前自动构建
- 测试覆盖率报告在 GitHub Actions Summary 中显示，不上传 artifacts

## 更新历史

- 2025-07-21: 创建 CI/CD 配置和部署文档
