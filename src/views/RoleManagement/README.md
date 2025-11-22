# 角色管理页面

## 📁 文件结构

```
RoleManagement/
├── index.vue                    # 角色列表主页面
├── components/
│   ├── RoleFormDialog.vue       # 角色新增/编辑对话框
│   └── RolePermissionDialog.vue # 角色权限分配对话框
└── README.md                    # 本说明文档
```

## 🎯 功能特性

### 1. 角色 CRUD 操作

- **查询**: 支持按角色编码、角色名称、状态进行筛选
- **新增**: 创建新角色，设置角色编码、名称、描述、排序和状态
- **编辑**: 修改现有角色信息（角色编码不可修改）
- **删除**: 支持单个删除和批量删除

### 2. 权限管理

- **权限树展示**: 以树形结构展示所有系统权限
- **权限分配**: 为角色分配或取消权限
- **权限搜索**: 支持按权限名称搜索过滤
- **权限类型**: 区分菜单权限、按钮权限、接口权限

### 3. 权限控制

页面根据用户权限动态显示功能按钮：

- `role:page` - 查看角色列表
- `role:create` - 新增角色
- `role:update` - 编辑角色
- `role:delete` - 删除角色
- `role:permission:grant` - 分配权限

## 🔧 技术实现

### API 封装

所有接口通过 `src/api/modules/role.ts` 统一管理，完全复用生成的 TypeScript 类型定义。

### 类型复用

严格使用 `src/api/generated/.ts.schemas.ts` 中的类型：

- `RoleResponse` - 角色响应数据
- `CreateRoleRequest` - 创建角色请求
- `UpdateRoleRequest` - 更新角色请求
- `RoleQueryRequest` - 查询角色请求
- `GrantPermissionsRequest` - 权限分配请求
- `PermissionTreeNodeResponse` - 权限树节点

### 代码风格

严格遵循项目现有规范，参照 `CollegeManagement` 和 `ClassManagement` 的实现模式。

## 🎨 UI 组件

### 主页面组件

- **搜索表单**: 角色编码、角色名称、状态筛选
- **数据表格**: 显示角色列表，支持多选
- **分页组件**: 支持页码和每页数量切换

### 对话框组件

- **RoleFormDialog**: 角色信息编辑表单，支持新增/编辑模式
- **RolePermissionDialog**: 权限树选择器，支持搜索和多选

## 📝 使用示例

### 创建角色

1. 点击"新增角色"按钮
2. 填写角色编码（唯一标识，只能包含字母、数字、下划线和中划线）
3. 填写角色名称、描述、排序等信息
4. 选择角色状态（启用/禁用）
5. 点击确定创建

### 分配权限

1. 在角色列表中点击"权限"按钮
2. 在权限树中勾选需要分配的权限
3. 支持搜索权限名称快速定位
4. 点击确定保存权限配置

### 更新用户角色

通过用户管理接口 `putAuthUserUpdateRoles` 可以覆盖式更新用户的角色列表。

## 🔗 相关路由

- 路由路径: `/role-management`
- 路由名称: `RoleManagement`
- 权限要求: `role:page`

## 📦 依赖的 API 接口

- `POST /auth/role/query` - 分页查询角色列表
- `GET /auth/role/list` - 查询所有角色（不分页）
- `POST /auth/role` - 创建角色
- `PUT /auth/role` - 更新角色
- `DELETE /auth/role/{roleId}` - 删除角色
- `GET /auth/role/{roleId}/permissions` - 查询角色权限树
- `POST /auth/role/permission/grant` - 给角色授权
- `PUT /auth/user/update/roles` - 更新用户角色
