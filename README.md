# 汇率API服务 (Exchange Rate API)

一个基于 Cloudflare Workers 构建的高性能汇率API服务，提供实时汇率查询和货币转换功能。

## 🚀 一键部署

[![Deploy to Cloudflare Workers](https://deploy.workers.cloudflare.com/button)](https://deploy.workers.cloudflare.com/?url=https://github.com/catpddo/exchange-rate)

> 点击上方按钮可以直接部署到你的 Cloudflare Workers 账户

## ✨ 特性

- 🚀 **高性能**: 基于 Cloudflare Workers 边缘计算，全球低延迟
- 💾 **智能缓存**: 使用 Cloudflare KV 存储汇率数据，减少外部API调用
- ⏰ **自动更新**: 每日两次自动更新汇率数据 (UTC 00:05 和 12:05)
- 🔒 **安全可靠**: 使用 Cloudflare Secrets 安全存储敏感信息
- 🌍 **多货币支持**: 支持所有主流货币代码
- 📊 **RESTful API**: 简洁易用的API接口
- 🌐 **自定义域名**: 支持自定义域名访问

## 🛠 技术栈

- **运行时**: Cloudflare Workers
- **框架**: Hono.js
- **语言**: TypeScript
- **存储**: Cloudflare KV
- **安全**: Cloudflare Secrets
- **包管理**: Bun
- **验证**: Zod
- **部署**: Wrangler

## 📋 依赖

```json
{
  "dependencies": {
    "@hono/zod-validator": "^0.6.0",
    "currency-codes": "^2.2.0", 
    "hono": "^4.7.10",
    "hono-rate-limiter": "^0.4.2",
    "zod": "^3.25.32"
  }
}
```

## 🚀 快速开始

### 方式一：一键部署 (推荐)

1. 点击上方的 "Deploy to Cloudflare Workers" 按钮
2. 登录你的 Cloudflare 账户
3. 按照提示完成部署
4. 配置必要的 Secrets (见下方说明)

### 方式二：手动部署

#### 环境要求

- Node.js 18+
- Bun
- Cloudflare 账户

#### 安装依赖

```bash
bun install
```

#### 环境配置

1. 配置 `wrangler.jsonc`:

```jsonc
{
  "name": "exchange-rate",
  "main": "src/index.ts", 
  "compatibility_date": "2025-05-28",
  "triggers": {
    "crons": ["5 0,12 * * *"]  // 每日 UTC 00:05 和 12:05 更新
  },
  "kv_namespaces": [
    {
      "binding": "KV",
      "id": "your-kv-namespace-id"
    }
  ],
  "routes": [
    {
      "pattern": "your-domain.com",
      "custom_domain": true
    }
  ]
}
```

2. 设置 Cloudflare Secrets (推荐):

```bash
# 设置更新密码
bun run cf-secret-pass

# 设置 ExchangeRate-API 密钥
bun run cf-secret-api-key
```

或者使用 wrangler 命令:

```bash
# 设置更新密码
wrangler secret put PASS

# 设置 API 密钥
wrangler secret put API_KEY
```

#### 本地开发

```bash
# 启动开发服务器
bun run dev

# 或者
bun run start
```

#### 部署

```bash
# 部署到 Cloudflare Workers
bun run deploy
```

### 部署后配置

无论使用哪种部署方式，都需要完成以下配置：

1. **创建 KV 命名空间**:
   ```bash
   wrangler kv:namespace create "KV"
   ```

2. **设置必要的 Secrets**:
   - `PASS`: 用于手动更新汇率的密码
   - `API_KEY`: 从 [ExchangeRate-API](https://exchangerate-api.com/) 获取的API密钥

3. **配置自定义域名** (可选):
   - 在 Cloudflare 控制台中添加自定义域名
   - 更新 `wrangler.jsonc` 中的 routes 配置

## 📖 API 文档

### 基础URL

```
# 使用 Workers 域名
https://your-worker.your-subdomain.workers.dev

# 或使用自定义域名
https://your-custom-domain.com
```

### 接口列表

#### 1. 获取特定基准货币的所有汇率

```http
GET /last/{currency}
```

**参数:**
- `currency` (string): 3位货币代码 (如: USD, EUR, CNY)

**响应示例:**
```json
{
  "message": "Success",
  "data": {
    "USD": 1,
    "EUR": 0.85,
    "CNY": 7.23,
    "JPY": 110.15
    // ... 其他货币
  }
}
```

#### 2. 货币转换

```http
GET /{baseCurrency}/{targetCurrency}/{amount?}
```

**参数:**
- `baseCurrency` (string): 源货币代码
- `targetCurrency` (string): 目标货币代码  
- `amount` (number, 可选): 转换金额，默认为1

**响应示例 (带金额):**
```json
{
  "message": "Success",
  "data": 85.50,
  "rate": 0.855,
  "base_code": "USD",
  "target_code": "EUR"
}
```

**响应示例 (仅汇率):**
```json
{
  "message": "Success", 
  "data": 0.855,
  "base_code": "USD",
  "target_code": "EUR"
}
```

#### 3. 手动更新汇率

```http
GET /update/{password}
```

**参数:**
- `password` (string): 更新密码 (通过 Cloudflare Secrets 配置)

**响应示例:**
```json
{
  "message": "Update success",
  "data": {
    "result": "success",
    "conversion_rates": { /* 汇率数据 */ },
    "time_last_updated_unix": 1640995200,
    "time_last_updated_utc": "Sat, 01 Jan 2022 00:00:00 +0000",
    "base_code": "USD"
  }
}
```

### 错误响应

```json
{
  "error": "Currency not found"
}
```

**常见错误码:**
- `400`: 请求参数错误
- `401`: 认证失败 (更新接口)
- `404`: 货币代码不存在或路由不存在

## 🔧 配置说明

### Cron 触发器

服务配置了定时任务，每日两次自动更新汇率数据:

```jsonc
"triggers": {
  "crons": ["5 0,12 * * *"]  // UTC 00:05 和 12:05
}
```

### KV 存储

汇率数据存储在 Cloudflare KV 中，键名为 `last`，存储格式为 JSON。

### Cloudflare Secrets

敏感信息通过 Cloudflare Secrets 安全存储:
- `PASS`: 手动更新汇率的密码
- `API_KEY`: ExchangeRate-API 的API密钥

### 自定义域名

支持配置自定义域名访问:

```jsonc
"routes": [
  {
    "pattern": "your-domain.com",
    "custom_domain": true
  }
]
```

### 外部API

使用 [ExchangeRate-API](https://exchangerate-api.com/) 获取汇率数据。

## 🏗 项目结构

```
exchange-rate/
├── src/
│   └── index.ts              # 主应用文件
├── .editorconfig             # 编辑器配置
├── .gitignore               # Git忽略文件
├── .prettierrc              # 代码格式化配置
├── bun.lock                 # 依赖锁定文件
├── package.json             # 项目配置
├── tsconfig.json            # TypeScript配置
├── worker-configuration.d.ts # Worker类型定义
├── wrangler.jsonc           # Cloudflare Workers配置
└── README.md                # 项目文档
```

## 🔄 数据流程

1. **初始化**: 首次请求时，如果KV中没有数据，自动调用外部API获取
2. **缓存**: 汇率数据存储在KV中，避免频繁调用外部API
3. **定时更新**: 每日两次自动更新汇率数据 (UTC 00:05 和 12:05)
4. **手动更新**: 支持通过API手动触发更新

## 🛡 安全特性

- **Secrets 管理**: 使用 Cloudflare Secrets 安全存储敏感信息
- **参数验证**: 使用 Zod 进行严格的参数验证
- **货币代码验证**: 基于 `currency-codes` 库验证货币代码有效性
- **访问控制**: 更新接口需要密码认证
- **错误处理**: 完善的错误处理和响应

## 📊 监控和日志

- 使用 Cloudflare Workers 内置的可观测性功能
- 支持请求ID追踪
- 自动错误日志记录

## 🛠 管理脚本

项目提供了便捷的管理脚本:

```bash
# 设置更新密码
bun run cf-secret-pass

# 设置 API 密钥
bun run cf-secret-api-key

# 生成类型定义
bun run cf-typegen

# 本地开发
bun run dev

# 部署
bun run deploy
```

## 🤝 贡献

欢迎提交 Issue 和 Pull Request！

## 📄 许可证

MIT License

## 🔗 相关链接

- [Cloudflare Workers 文档](https://developers.cloudflare.com/workers/)
- [Cloudflare Secrets 文档](https://developers.cloudflare.com/workers/configuration/secrets/)
- [Hono.js 文档](https://hono.dev/)
- [ExchangeRate-API](https://exchangerate-api.com/) 