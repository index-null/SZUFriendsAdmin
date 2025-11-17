# API 架构说明

## 📁 目录结构

```
src/api/
├── index.ts              # Axios 核心实例（拦截器、Token 管理、错误处理）
├── mutator.ts            # Orval 专用轻量级实例（用于代码生成）
├── types.ts              # 全局类型定义
├── request.ts            # 请求方法封装（get/post/put/delete）
├── modules/              # 手写的业务 API（正式使用）⭐
│   ├── auth.ts          # 认证相关：登录、注册、登出
│   └── user.ts          # 用户相关：获取信息、更新资料
└── generated/            # Orval 自动生成（仅供参考）📖
    ├── .ts.schemas.ts
    ├── 用户认证控制器-认证管理/
    ├── 班级相关信息-班级控制器/
    └── ...
```

## 🎯 使用原则

### 1️⃣ **手写 API（`modules/`）- 正式调用**

- ✅ 所有业务代码使用手写的 API
- ✅ 类型定义参考 `generated/` 中的类型
- ✅ 灵活处理业务逻辑
- ✅ 统一的错误处理和 Loading

**示例：**

```typescript
import { login, register } from '@/api/modules/auth'

// 在 Store 或组件中调用
const result = await login({ username: 'test', password: '123456' })
```

### 2️⃣ **生成的 API（`generated/`）- 仅供参考**

- 📖 查看后端接口定义和类型
- 📖 参考请求参数和响应结构
- 📖 了解可用的接口列表
- ❌ 不直接在业务代码中调用

**作用：**

- 帮助理解后端 API 结构
- 提供准确的 TypeScript 类型定义
- 自动同步后端接口变更

## 🔄 工作流程

### 步骤 1：生成 API 代码

```bash
npm run api
# 或分步执行
npm run download-api   # 下载 OpenAPI 文档
npm run generate-api   # 生成 TypeScript 代码
```

### 步骤 2：查看生成的类型

```typescript
// 打开 src/api/generated/.ts.schemas.ts
// 找到需要的类型定义，例如：
export interface LoginRequest {
  username?: string
  password?: string
  wxMpCode?: string
}

export interface LoginResponse {
  token?: string
  userId?: number
  username?: string
  roles?: string[]
  permissions?: string[]
}
```

### 步骤 3：更新手写的 API

```typescript
// src/api/modules/auth.ts
// 根据生成的类型定义，更新接口
export interface LoginParams {
  username: string // 参考 LoginRequest
  password: string
  wxMpCode?: string
}

export interface LoginData {
  token: string // 参考 LoginResponse
  userId: number
  username: string
  roles?: string[]
}

export const login = (params: LoginParams) => {
  return post<LoginData>('/auth/login', params)
}
```

### 步骤 4：在业务代码中使用

```typescript
// Store
import { login } from '@/api/modules/auth'

const userLogin = async (username: string, password: string) => {
  const data = await login({ username, password })
  setToken(data.token)
  // ...
}
```

## 🔧 核心功能

### Axios 拦截器（`index.ts`）

✅ 自动添加 JWT Token  
✅ 统一错误处理和提示  
✅ 自动 Loading 动画  
✅ Token 过期自动跳转登录  
✅ 详细的请求/响应日志（开发环境）

### 请求封装（`request.ts`）

```typescript
// 支持泛型，类型安全
const user = await get<UserInfo>('/user/info')
const result = await post<LoginData>('/auth/login', { ... })
const updated = await put<UserInfo>('/user/profile', { ... })
await delete('/user/123')
```

### 自定义配置

```typescript
// 禁用 Loading
await getUserInfo({ showLoading: false })

// 禁用错误提示 + 自定义处理
await login({
  showError: false,
  errorHandler: (error) => {
    console.log('自定义处理:', error)
  },
})
```

## 📝 最佳实践

1. **新接口开发**
   - 先运行 `npm run api` 查看后端定义
   - 在 `modules/` 中创建对应的函数
   - 使用生成的类型定义

2. **类型同步**
   - 定期运行 `npm run api` 更新
   - 检查 `generated/` 中的类型变更
   - 同步更新 `modules/` 中的接口

3. **错误处理**
   - 拦截器已统一处理常见错误
   - 业务特殊错误可使用 `errorHandler`
   - 不需要在每个接口中重复处理

4. **Loading 管理**
   - 全局接口自动显示 Loading
   - 特殊场景可禁用：`showLoading: false`
   - 避免多个请求导致 Loading 闪烁

## 🚀 后端接口对接示例

### 登录接口

```typescript
// 后端定义（generated/.ts.schemas.ts）
interface LoginRequest {
  username?: string
  password?: string
  wxMpCode?: string
}

interface LoginResponse {
  token?: string
  userId?: number
  username?: string
}

// 前端使用（modules/auth.ts）
export interface LoginParams {
  username: string // 必填
  password: string // 必填
  wxMpCode?: string // 可选
}

export interface LoginData {
  token: string // 必填
  userId: number // 必填
  username: string // 必填
  roles?: string[] // 扩展
  permissions?: string[] // 扩展
}

export const login = (params: LoginParams) => {
  return post<LoginData>('/auth/login', params)
}
```

### 注册接口

```typescript
// 后端定义
interface RegisterRequest {
  username: string // 登录账号
  password: string // 密码
  nickname: string // 显示昵称
}

// 前端使用
export interface RegisterParams {
  username: string
  password: string
  nickname: string
}

export const register = (params: RegisterParams) => {
  return post<RegisterData>('/auth/register', params)
}
```

## ⚠️ 注意事项

1. **环境变量读取**
   - `mutator.ts` 使用特殊方式读取 env（避免 esbuild 编译错误）
   - 实际运行时会正确读取 `import.meta.env.VITE_API_BASE_URL`

2. **生成文件管理**
   - `generated/` 目录已在 `.gitignore` 中注释
   - 团队协作可选择提交或忽略
   - 建议：小团队提交，大团队各自生成

3. **类型安全**
   - 所有接口都有完整的类型定义
   - 参数和返回值类型必须匹配
   - IDE 会自动提示错误

## 📚 相关文档

- [Axios 官方文档](https://axios-http.com/)
- [Orval 官方文档](https://orval.dev/)
- [OpenAPI 规范](https://swagger.io/specification/)
