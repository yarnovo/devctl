# 部署文档

本文档详细说明 devctl 项目的 CI/CD 流程和部署配置。

## 概述

devctl 使用 GitHub Actions 实现自动化的持续集成和持续部署（CI/CD）。当代码推送到仓库或创建标签时，会自动触发相应的工作流程。

## CI/CD 流程

### 持续集成（CI）

CI 流程会在以下情况触发：

- 推送代码到 `main` 分支
- 创建 Pull Request 到 `main` 分支
- 创建以 `v` 开头的标签

CI 流程包含以下步骤：

1. **检出代码** - 获取最新的代码库
2. **设置 Node.js 环境** - 使用 Node.js 20.x 版本
3. **安装依赖** - 使用 `npm ci` 安装精确版本的依赖
4. **代码检查** - 执行 lint、类型检查和测试
5. **覆盖率报告** - 生成测试覆盖率报告并在 GitHub Actions Summary 中显示

### 持续部署（CD）

CD 流程仅在创建以 `v` 开头的标签时触发，例如：`v1.0.0`、`v2.1.0-beta`。

CD 流程包含以下步骤：

1. **检出代码** - 获取标签对应的代码
2. **设置 Node.js 环境** - 使用 Node.js 20.x LTS 版本
3. **安装依赖** - 使用 `npm ci`
4. **发布到 npm** - 将包发布到 npm 仓库（`prepublishOnly` 钩子会自动执行构建）
5. **创建 GitHub Release** - 自动创建发布说明

## 环境变量配置

### 必需的 Secrets

在 GitHub 仓库设置中需要配置以下 Secrets：

1. **NPM_TOKEN**
   - 用途：npm 发布认证
   - 获取方式：
     1. 登录 [npmjs.com](https://www.npmjs.com/)
     2. 进入 Account Settings -> Access Tokens
     3. 生成新的 Automation Token
     4. 复制 Token 值
   - 配置路径：Repository Settings -> Secrets and variables -> Actions -> New repository secret

2. **GITHUB_TOKEN**
   - 用途：创建 GitHub Release
   - 说明：这是 GitHub Actions 自动提供的，无需手动配置

## 发布流程

### 1. 准备发布

```bash
# 确保所有代码已提交
git status

# 确保在 main 分支
git checkout main
git pull origin main

# 运行本地检查
npm run check
```

### 2. 更新版本号

```bash
# 更新 package.json 中的版本号
# 可以手动编辑或使用 npm version 命令

# 补丁版本（例如：1.0.0 -> 1.0.1）
npm version patch

# 小版本（例如：1.0.0 -> 1.1.0）
npm version minor

# 主版本（例如：1.0.0 -> 2.0.0）
npm version major

# 预发布版本（例如：1.0.0 -> 1.0.1-beta.0）
npm version prerelease --preid=beta
```

### 3. 更新 CHANGELOG

在发布前，更新 `CHANGELOG.md` 文件，记录本次版本的更改内容。

### 4. 创建标签并推送

```bash
# 如果使用 npm version，它会自动创建标签
# 否则手动创建标签
git tag v1.0.0

# 推送代码和标签
git push origin main --tags
```

### 5. 验证发布

1. 检查 [GitHub Actions](https://github.com/你的用户名/devctl/actions) 页面，确认 CI/CD 工作流运行成功
2. 访问 [npm 包页面](https://www.npmjs.com/package/devctl) 确认新版本已发布
3. 检查 [GitHub Releases](https://github.com/你的用户名/devctl/releases) 页面

## 故障排除

### CI 失败

如果 CI 流程失败，请检查：

1. **Lint 错误** - 运行 `npm run lint:fix` 修复格式问题
2. **类型错误** - 运行 `npm run typecheck` 查看具体错误
3. **测试失败** - 运行 `npm test` 查看失败的测试用例

### CD 失败

如果 CD 流程失败，请检查：

1. **NPM_TOKEN 配置** - 确保 Token 有效且具有发布权限
2. **包名冲突** - 确保 npm 上没有同名包或你有权限发布
3. **构建错误** - 本地运行 `npm run prepublishOnly` 确保构建成功

### 本地测试 GitHub Actions

可以使用 [act](https://github.com/nektos/act) 在本地测试 GitHub Actions：

```bash
# 安装 act
brew install act  # macOS
# 或查看其他安装方式：https://github.com/nektos/act#installation

# 测试 CI 工作流
act push

# 测试 CD 工作流（使用标签触发）
act push --ref refs/tags/v1.0.0
```

## 最佳实践

1. **版本管理**
   - 遵循语义化版本规范（Semantic Versioning）
   - 主版本号：不兼容的 API 修改
   - 次版本号：向下兼容的功能性新增
   - 修订号：向下兼容的问题修正

2. **发布前检查清单**
   - [ ] 所有测试通过
   - [ ] 代码已经过 review
   - [ ] CHANGELOG.md 已更新
   - [ ] README.md 文档是最新的
   - [ ] 没有敏感信息或密钥

3. **预发布版本**
   - 使用 `-beta`、`-alpha` 等后缀标记预发布版本
   - GitHub Actions 会自动将其标记为 prerelease

4. **回滚策略**
   - 如果发布出现问题，可以在 npm 上废弃（deprecate）有问题的版本
   - 发布修复版本而不是删除已发布的版本

## 监控和通知

建议配置以下监控：

1. GitHub Actions 失败通知（在 GitHub 设置中配置邮件通知）
2. npm 下载量监控
3. 依赖更新提醒（使用 Dependabot）

## 安全考虑

1. **保护 main 分支**
   - 启用分支保护规则
   - 要求 PR review
   - 要求 CI 检查通过

2. **定期更新依赖**
   - 使用 `npm audit` 检查安全漏洞
   - 及时更新有安全问题的依赖

3. **密钥管理**
   - 定期轮换 NPM_TOKEN
   - 使用最小权限原则
   - 不要在代码中硬编码任何密钥
