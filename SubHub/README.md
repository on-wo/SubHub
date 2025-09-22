# SubHub

简洁的机场订阅管理面板，运行在 Cloudflare Workers 上。

## 快速部署

👉 [点击访问部署向导](https://your-worker.pages.dev/deploy)

跟随向导一步步操作即可完成部署，无需复杂配置！

## 特性

- 支持用户/管理员分权限
- 订阅信息实时解析
- 全部数据持久化在 KV
- 原生前端，无需构建
- 支持流量/时间统计

## 部署步骤

1. 创建 KV 命名空间：

```bash
wrangler kv:namespace create USERS_KV
```

2. 修改 wrangler.toml，配置 KV ID 和环境变量：

```toml
kv_namespaces = [
  { binding = "USERS_KV", id = "xxx" }
]

[vars]
ADMIN_KEY = "your-admin-key"
JWT_SECRET = "your-jwt-secret"
```

3. 部署到 Cloudflare：

```bash
wrangler publish
```

## 本地开发

```bash
# 安装依赖
npm install

# 启动开发服务器
npm run dev
```

## 使用说明

1. 用管理员口令登录后台（`/admin`）
2. 添加用户，设置 UUID 和订阅地址
3. 用户用 UUID 登录（`/login`）查看订阅信息

## 技术栈

- Cloudflare Workers
- Hono (Web 框架)
- Tailwind CSS
- JWT 认证

## License

MIT
