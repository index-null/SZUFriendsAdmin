# Husky Git Hooks 配置说明

本项目使用 Husky 来管理 Git Hooks，确保代码质量。

## 🎯 配置的 Hooks

### 1. pre-commit（提交前检查）

**位置**: `.husky/pre-commit`

**执行时机**: 执行 `git commit` 命令时，在生成 commit 之前

**检查内容**:

#### Step 1: Lint-Staged（代码规范检查）

- **ESLint**: 检查并自动修复 JavaScript/TypeScript/Vue 代码风格问题
- **Prettier**: 格式化代码（统一缩进、换行等）
- **作用范围**: 仅检查暂存区（staged）的文件
- **配置位置**: `package.json` 中的 `lint-staged` 字段

#### Step 2: TypeScript 类型检查

- **vue-tsc**: 运行 TypeScript 编译器进行类型检查
- **命令**: `pnpm run type-check`（即 `vue-tsc -b --noEmit`）
- **作用范围**: 检查整个项目的类型安全
- **速度**: 约 3-10 秒（取决于项目大小）

**重要性**:

- ✅ **阻止类型错误代码被提交**，这是本次修复的核心
- ✅ 确保提交的代码符合项目规范
- ✅ 减少 Code Review 的负担

**如何跳过**（不推荐）:

```bash
git commit --no-verify -m "commit message"
```

### 2. commit-msg（提交信息检查）

**位置**: `.husky/commit-msg`

**执行时机**: 执行 `git commit` 命令时，在写入 commit message 之后

**检查内容**:

- 目前仅做基础验证，没有强制 commit message 格式
- 可以取消注释来启用严格的 commit message 规范

**推荐格式** (Conventional Commits):

```
type(scope): subject

例如:
feat(user): add login feature
fix(api): handle error response
docs(readme): update installation guide
```

**类型说明**:

- `feat`: 新功能
- `fix`: Bug 修复
- `docs`: 文档更新
- `style`: 代码格式调整（不影响功能）
- `refactor`: 重构（既不是新功能也不是 Bug 修复）
- `test`: 测试相关
- `chore`: 构建过程或辅助工具的变动
- `perf`: 性能优化
- `ci`: CI/CD 配置
- `build`: 构建系统
- `revert`: 回退

## 📝 Lint-Staged 配置

**位置**: `package.json` 中的 `lint-staged` 字段

```json
{
  "lint-staged": {
    "*.{js,jsx,ts,tsx,vue}": ["eslint --fix", "prettier --write"],
    "*.{json,md,css,scss,html}": ["prettier --write"]
  }
}
```

## 🔧 可用的 NPM Scripts

```bash
# 开发服务器
pnpm run dev

# 类型检查（不生成文件）
pnpm run type-check

# 代码检查
pnpm run lint          # 检查并自动修复
pnpm run lint:check    # 仅检查，不修复

# 代码格式化
pnpm run format        # 格式化所有文件
pnpm run format:check  # 检查格式，不修改

# 构建
pnpm run build         # 类型检查 + 构建生产版本

# API 相关
pnpm run download-api  # 下载 OpenAPI 规范
pnpm run generate-api  # 生成 API 代码
pnpm run api           # 下载 + 生成（一键操作）
```

## 🚨 为什么之前没有发现类型错误？

### 问题原因

之前的 `.husky/pre-commit` 只包含：

```bash
pnpm exec lint-staged
```

这只运行了 ESLint 和 Prettier，**没有运行 TypeScript 类型检查**。

### 修复方案

现在的 `.husky/pre-commit` 包含：

```bash
# 1. Lint-Staged（ESLint + Prettier）
pnpm exec lint-staged || exit 1

# 2. TypeScript 类型检查
pnpm run type-check || exit 1
```

这样可以确保：

- ✅ 代码风格符合规范（ESLint + Prettier）
- ✅ TypeScript 类型检查通过（vue-tsc）
- ✅ 如果任何检查失败，commit 会被阻止

## 💡 最佳实践

### 1. 提交前自检

```bash
# 检查暂存的文件
git status

# 运行完整检查（可选）
pnpm run lint:check
pnpm run type-check

# 提交
git commit -m "your message"
```

### 2. 如果 pre-commit 检查失败

```bash
# 查看具体错误信息
# Husky 会显示详细的错误输出

# 修复问题后重新 add
git add .

# 重新提交
git commit -m "your message"
```

### 3. 处理类型错误

```bash
# 运行类型检查查看所有错误
pnpm run type-check

# 修复错误后重新运行
pnpm run type-check

# 确认无误后提交
git add .
git commit -m "fix: resolve type errors"
```

## 🔍 故障排除

### 问题 1: Husky hooks 不执行

```bash
# 重新安装 husky
pnpm run prepare

# 确保 hooks 有执行权限
chmod +x .husky/pre-commit
chmod +x .husky/commit-msg
```

### 问题 2: 类型检查太慢

```bash
# 如果类型检查太慢，可以考虑：
# 1. 升级硬件（SSD、更多内存）
# 2. 使用增量编译（已配置：vue-tsc -b）
# 3. 减少检查的文件范围（不推荐）
```

### 问题 3: 紧急情况需要跳过检查

```bash
# 仅在紧急情况使用，事后必须修复问题
git commit --no-verify -m "emergency fix"
```

## 📚 相关文档

- [Husky 官方文档](https://typicode.github.io/husky/)
- [Lint-Staged 文档](https://github.com/okonet/lint-staged)
- [Conventional Commits](https://www.conventionalcommits.org/)
- [TypeScript Compiler Options](https://www.typescriptlang.org/tsconfig)

## 🎯 总结

通过配置 Husky Git Hooks，我们实现了：

1. ✅ **代码质量保证**: 阻止不符合规范的代码被提交
2. ✅ **类型安全**: 阻止类型错误的代码被提交（本次新增）
3. ✅ **团队协作**: 统一的代码风格和提交规范
4. ✅ **CI/CD 优化**: 减少 CI 失败的概率

记住：**好的工具能帮助我们写出更好的代码！** 🚀
