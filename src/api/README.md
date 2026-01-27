# API 使用指南

## 自动类型解包机制

本项目使用了自定义的 `UnwrapResult` 类型来自动解包后端响应，使 API 调用更加简洁和类型安全。

### 工作原理

后端返回的标准响应格式：

```json
{
  "code": 200,
  "message": "操作成功",
  "data": { ... }  // 实际数据
}
```

**响应拦截器**（`src/api/mutator.ts`）会自动提取 `data` 字段，所以前端实际收到的是：

```javascript
{ ... }  // 直接是 data 中的内容
```

**类型系统**通过 `UnwrapResult<T>` 自动匹配这个行为：

```typescript
// 生成的 API 类型: ResultPageResultUserPageVo
// UnwrapResult 解包后: PageResultUserPageVo

type UnwrapResult<T> = T extends { data?: infer D } ? D : T
```

### 使用示例

#### ✅ 正确用法（无需类型断言）

```typescript
// 1. 分页查询
const response = await userApi.postAuthUserPages({ current: 1, size: 10 })
// response 类型: PageResultUserPageVo | undefined
// 可直接访问: response.records, response.total, response.current, response.size

// 2. 列表查询
const roles = await roleApi.getAuthRoleList()
// roles 类型: RoleResponse[] | undefined
// 直接是数组，无需访问 data 字段

// 3. 详情查询
const user = await userApi.getAuthUserUserId(123)
// user 类型: UserEntity | undefined
// 直接是用户对象

// 4. 更新操作
await userApi.putAuthUserUpdateRoles({ userId: 1, roleIds: [1, 2] })
// 无返回值或返回布尔值
```

#### ❌ 错误用法（不要这样做）

```typescript
// ❌ 不需要访问 response.data
const response = await userApi.postAuthUserPages(...)
const data = response.data  // 错误！response 已经是解包后的数据

// ❌ 不需要判断 response.code
if (response.code === 200) {  // 错误！response 没有 code 字段
  // ...
}

// ❌ 不需要类型断言
const users = (await userApi.postAuthUserPages(...)) as any as PageResult
// 错误！类型已经自动推断正确
```

### 类型映射表

| 生成的类型                   | 解包后类型             | 说明     |
| ---------------------------- | ---------------------- | -------- |
| `ResultPageResultUserPageVo` | `PageResultUserPageVo` | 分页数据 |
| `ResultListRoleResponse`     | `RoleResponse[]`       | 角色数组 |
| `ResultUserEntity`           | `UserEntity`           | 用户实体 |
| `ResultBoolean`              | `boolean`              | 布尔值   |
| `ResultString`               | `string`               | 字符串   |
| `ResultLong`                 | `number`               | 数字     |

### 错误处理

```typescript
try {
  const response = await userApi.postAuthUserPages(params)
  if (response) {
    // 正常处理数据
    tableData.value = response.records || []
  } else {
    // 响应为空的情况（极少见）
    ElMessage.error('获取数据失败')
  }
} catch (error) {
  // 网络错误、权限错误等异常
  console.error('请求失败:', error)
  ElMessage.error('请求失败')
}
```

### 响应拦截器逻辑

详见 `src/api/mutator.ts`:

```typescript
service.interceptors.response.use(
  (response) => {
    const { data } = response
    // 成功时返回 data.data，失败时直接返回 data
    if (
      data &&
      (data.code === 0 || data.code === 200 || data.success === true)
    ) {
      return data.data || data
    }
    return data
  },
  (error) => {
    return Promise.reject(error)
  },
)
```

### 常见问题

**Q: 为什么 TypeScript 提示类型可能是 `undefined`？**  
A: 因为网络请求可能失败或返回空数据，所以类型包含 `undefined`。使用前应该做非空检查。

**Q: 能否访问原始的 `code` 和 `message`？**  
A: 响应拦截器已经处理了这些字段。如果需要，可以在拦截器中抛出错误，在 catch 块中处理。

**Q: 如何处理错误响应？**  
A: 使用 try-catch 块。响应拦截器会在错误时 reject promise。

## API 重新生成

当后端 API 更新后，运行以下命令重新生成 API 代码：

```bash
pnpm run api
# 或分步执行
pnpm run download-api  # 下载最新 OpenAPI 规范
pnpm run generate-api  # 生成 API 代码
```

生成的代码会自动应用 `UnwrapResult` 类型系统。
