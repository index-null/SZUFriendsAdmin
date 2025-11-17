# Husky Git Hooks 配置说明

## 📦 已配置的 Git Hooks

### 1. pre-commit

**触发时机**: 执行 `git commit` 之前

**功能**:

- 自动对暂存的文件执行 ESLint 检查和修复
- 自动格式化代码（Prettier）
- 只处理暂存区（staged）的文件，不影响其他文件

**工作流程**:

```bash
git add .
git commit -m "feat: add new feature"
# ↓ 自动执行以下操作
# 1. 对 *.{js,ts,vue} 文件执行 eslint --fix
# 2. 对 *.{js,ts,vue} 文件执行 prettier --write
# 3. 对 *.{json,md,css,scss,html} 文件执行 prettier --write
# 4. 如果有修改，自动添加到 commit
# ✅ 提交成功
```

### 2. commit-msg（可选）

**触发时机**: 执行 `git commit` 时

**功能**:

- 检查 commit 信息格式（当前已注释）
- 可启用严格的 commit 信息规范

**标准格式**（如需启用，取消注释）:

```
type(scope): subject

类型 (type):
  - feat: 新功能
  - fix: 修复 bug
  - docs: 文档更新
  - style: 代码格式（不影响功能）
  - refactor: 重构
  - test: 测试相关
  - chore: 构建、工具等
  - perf: 性能优化
  - ci: CI/CD 配置
  - build: 构建系统
  - revert: 回退

示例:
  ✅ feat(user): add login feature
  ✅ fix(api): handle error response
  ✅ docs(readme): update installation guide
  ❌ add login (缺少类型)
```

## 🚀 使用方式

### 正常提交

```bash
# 1. 修改代码
# 2. 添加到暂存区
git add .

# 3. 提交（自动 lint + format）
git commit -m "feat(home): add user profile"

# 4. 推送
git push
```

### 跳过 Hooks（不推荐）

如果需要跳过 hooks（紧急情况）:

```bash
git commit --no-verify -m "emergency fix"
```

## 📝 Lint-Staged 配置

在 `package.json` 中配置：

```json
{
  "lint-staged": {
    "*.{js,jsx,ts,tsx,vue}": ["eslint --fix", "prettier --write"],
    "*.{json,md,css,scss,html}": ["prettier --write"]
  }
}
```

## 🔧 自定义配置

### 修改 pre-commit

编辑 `.husky/pre-commit` 文件：

```bash
#!/usr/bin/env sh
. "$(dirname -- "$0")/_/husky.sh"

# 添加额外的检查
# npm run test          # 运行测试
# npm run type-check    # 类型检查

npx lint-staged
```

### 启用 commit-msg 规范

编辑 `.husky/commit-msg`，取消注释检查代码即可。

### 添加更多 hooks

创建新 hook:

```bash
# 例如: pre-push hook
echo '#!/usr/bin/env sh
. "$(dirname -- "$0")/_/husky.sh"

npm run test
npm run build
' > .husky/pre-push

chmod +x .husky/pre-push
```

## 🎯 最佳实践

### 1. 小步提交

```bash
# ✅ 好的做法：小步提交，单一职责
git add src/components/UserProfile.vue
git commit -m "feat(user): add user profile component"

git add src/api/user.ts
git commit -m "feat(api): add user API"

# ❌ 不好的做法：一次提交太多变更
git add .
git commit -m "update project"
```

### 2. 提交前检查

```bash
# 提交前手动检查
npm run lint:check
npm run format:check
npm run build

# 确认无误后提交
git add .
git commit -m "feat: add new feature"
```

### 3. 处理 Hook 失败

如果 pre-commit hook 失败：

```bash
# 1. 查看错误信息
# 2. 修复问题
# 3. 重新添加和提交
git add .
git commit -m "fix: resolve lint errors"

# 或手动运行检查
npm run lint
npm run format
```

## 🔍 故障排查

### Hook 不执行？

1. 检查 `.husky` 目录权限

   ```bash
   chmod +x .husky/pre-commit
   chmod +x .husky/commit-msg
   ```

2. 确认 husky 已安装

   ```bash
   npm install
   ```

3. 重新初始化
   ```bash
   rm -rf .husky
   npx husky init
   # 然后重新配置 hooks
   ```

### Lint-staged 失败？

1. 检查暂存区文件

   ```bash
   git status
   ```

2. 手动运行 lint-staged

   ```bash
   npx lint-staged
   ```

3. 查看详细错误
   ```bash
   npx lint-staged --verbose
   ```

### 如何临时禁用？

```bash
# 方法 1: 使用 --no-verify
git commit --no-verify -m "message"

# 方法 2: 临时移除 hooks
mv .husky/pre-commit .husky/pre-commit.bak

# 恢复
mv .husky/pre-commit.bak .husky/pre-commit
```

## 📊 配置效果

### 提交前

```
src/
├── components/
│   └── UserProfile.vue  (未格式化，有 lint 错误)
└── api/
    └── user.ts          (未格式化)
```

### 提交后

```bash
git add .
git commit -m "feat: add user profile"

# ✨ 自动执行:
# ✅ ESLint 修复代码问题
# ✅ Prettier 格式化代码
# ✅ 提交格式化后的代码
```

### 团队协作优势

- ✅ 统一代码风格
- ✅ 减少 code review 时间
- ✅ 避免格式化相关的冲突
- ✅ 保证代码质量

## 🔗 相关资源

- [Husky 官方文档](https://typicode.github.io/husky/)
- [Lint-staged 文档](https://github.com/okonet/lint-staged)
- [Conventional Commits](https://www.conventionalcommits.org/)

---

**配置最后更新**: 2025-11-17  
**Husky 版本**: 9.1.7  
**Lint-staged 版本**: 16.2.6
