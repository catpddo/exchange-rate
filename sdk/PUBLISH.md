# SDK 发布指南

## 📦 发布到 NPM

### 1. 准备工作

确保你已经：
- 注册了 NPM 账户
- 登录到 NPM：`npm login`
- 验证登录状态：`npm whoami`

### 2. 发布步骤

```bash
# 进入SDK目录
cd sdk

# 确保依赖已安装
bun install

# 构建包
bun run build

# 检查包内容
npm pack --dry-run

# 发布到NPM
npm publish --access public
```

### 3. 版本管理

更新版本号：
```bash
# 补丁版本 (1.0.0 -> 1.0.1)
npm version patch

# 次要版本 (1.0.0 -> 1.1.0)
npm version minor

# 主要版本 (1.0.0 -> 2.0.0)
npm version major
```

### 4. 发布检查清单

发布前确保：
- [ ] 所有测试通过
- [ ] 文档已更新
- [ ] 版本号已更新
- [ ] CHANGELOG 已更新
- [ ] 构建成功
- [ ] 包大小合理

### 5. 发布后验证

```bash
# 安装并测试发布的包
npm install @pddo/exchange-rate-sdk
```

## 🔧 开发工作流

### 本地开发
```bash
# 开发模式（监听文件变化）
bun run dev

# 类型检查
bun run type-check

# 构建
bun run build
```

### 测试示例
```bash
# 运行基础示例
bun run examples/basic-usage.ts

# 运行批量操作示例
bun run examples/batch-operations.ts
```

## 📋 发布清单

### 首次发布
1. 确认包名 `@pddo/exchange-rate-sdk` 可用
2. 设置正确的 `repository` 和 `homepage` URL
3. 添加适当的 `keywords`
4. 确保 `license` 正确
5. 验证 `exports` 配置

### 后续发布
1. 更新版本号
2. 更新 CHANGELOG
3. 测试新功能
4. 更新文档
5. 发布

## 🚀 自动化发布

可以考虑使用 GitHub Actions 自动化发布流程：

```yaml
name: Publish to NPM
on:
  release:
    types: [published]
jobs:
  publish:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '18'
          registry-url: 'https://registry.npmjs.org'
      - run: cd sdk && npm ci
      - run: cd sdk && npm run build
      - run: cd sdk && npm publish --access public
        env:
          NODE_AUTH_TOKEN: ${{ secrets.NPM_TOKEN }}
``` 