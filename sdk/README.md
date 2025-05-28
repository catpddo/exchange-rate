# @pddo/exchange-rate-sdk

[![npm version](https://badge.fury.io/js/@pddo%2Fexchange-rate-sdk.svg)](https://badge.fury.io/js/@pddo%2Fexchange-rate-sdk)
[![TypeScript](https://img.shields.io/badge/TypeScript-Ready-blue.svg)](https://www.typescriptlang.org/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

汇率API的TypeScript SDK，提供简洁易用的接口来访问实时汇率数据和货币转换功能。

## ✨ 特性

- 🚀 **TypeScript支持**: 完整的类型定义，提供优秀的开发体验
- 🌐 **现代化API**: 基于Promise的异步API，支持async/await
- 🛡️ **错误处理**: 完善的错误处理机制和自定义错误类型
- ⚡ **高性能**: 内置请求超时和批量操作支持
- 🔧 **可配置**: 灵活的配置选项，支持自定义域名和请求头
- 📦 **轻量级**: 零依赖，体积小巧
- 🌍 **多环境**: 支持Node.js和浏览器环境

## 📦 安装

```bash
# 使用 npm
npm install @pddo/exchange-rate-sdk

# 使用 yarn
yarn add @pddo/exchange-rate-sdk

# 使用 pnpm
pnpm add @pddo/exchange-rate-sdk

# 使用 bun
bun add @pddo/exchange-rate-sdk
```

## 🚀 快速开始

### 基础用法

```typescript
import { ExchangeRateSDK } from '@pddo/exchange-rate-sdk';

// 创建SDK实例
const sdk = new ExchangeRateSDK();

// 获取汇率
const rate = await sdk.getExchangeRate('USD', 'EUR');
console.log(`1 USD = ${rate.data} EUR`);

// 货币转换
const result = await sdk.convertCurrency('USD', 'CNY', 100);
console.log(`100 USD = ${result.data} CNY`);
```

### 使用便捷函数

```typescript
import { createExchangeRateSDK } from '@pddo/exchange-rate-sdk';

const sdk = createExchangeRateSDK({
  baseURL: 'https://your-api.com',
  timeout: 5000,
  debug: true
});
```

### 自定义配置

```typescript
import { ExchangeRateSDK } from '@pddo/exchange-rate-sdk';

const sdk = new ExchangeRateSDK({
  baseURL: 'https://exchange-api.pd.do',
  timeout: 10000,
  headers: {
    'X-Custom-Header': 'value'
  },
  debug: false
});
```

## 📖 API 文档

### ExchangeRateSDK

#### 构造函数

```typescript
new ExchangeRateSDK(options?: ExchangeRateSDKOptions)
```

#### 配置选项

```typescript
interface ExchangeRateSDKOptions {
  baseURL?: string;        // API基础URL，默认: 'https://exchange-api.pd.do'
  timeout?: number;        // 请求超时时间（毫秒），默认: 10000
  headers?: Record<string, string>; // 自定义请求头
  debug?: boolean;         // 是否启用调试模式，默认: false
}
```

### 主要方法

#### 1. 获取特定基准货币的所有汇率

```typescript
async getCurrencyRates(currency: string): Promise<CurrencyRatesResponse>
```

**示例:**
```typescript
const rates = await sdk.getCurrencyRates('USD');
console.log(rates.data.EUR); // 美元对欧元的汇率
console.log(rates.data.CNY); // 美元对人民币的汇率
```

#### 2. 获取两种货币之间的汇率

```typescript
async getExchangeRate(baseCurrency: string, targetCurrency: string): Promise<RateResponse>
```

**示例:**
```typescript
const rate = await sdk.getExchangeRate('EUR', 'USD');
console.log(`1 EUR = ${rate.data} USD`);
```

#### 3. 进行货币转换

```typescript
async convertCurrency(baseCurrency: string, targetCurrency: string, amount: number): Promise<ConversionResponse>
```

**示例:**
```typescript
const result = await sdk.convertCurrency('GBP', 'JPY', 50);
console.log(`50 GBP = ${result.data} JPY`);
console.log(`汇率: ${result.rate}`);
```

#### 4. 批量获取汇率

```typescript
async getBatchRates(pairs: Array<[string, string]>): Promise<Array<RateResponse>>
```

**示例:**
```typescript
const rates = await sdk.getBatchRates([
  ['USD', 'EUR'],
  ['USD', 'CNY'],
  ['EUR', 'JPY']
]);

rates.forEach(rate => {
  console.log(`${rate.base_code} -> ${rate.target_code}: ${rate.data}`);
});
```

#### 5. 批量货币转换

```typescript
async batchConvert(conversions: Array<{from: string, to: string, amount: number}>): Promise<Array<ConversionResponse>>
```

**示例:**
```typescript
const results = await sdk.batchConvert([
  { from: 'USD', to: 'EUR', amount: 100 },
  { from: 'EUR', to: 'CNY', amount: 50 },
  { from: 'GBP', to: 'JPY', amount: 25 }
]);

results.forEach(result => {
  console.log(`${result.base_code} -> ${result.target_code}: ${result.data}`);
});
```

#### 6. 手动更新汇率（需要密码）

```typescript
async updateRates(password: string): Promise<UpdateResponse>
```

**示例:**
```typescript
try {
  const result = await sdk.updateRates('your-password');
  console.log('汇率更新成功:', result.message);
} catch (error) {
  console.error('更新失败:', error.message);
}
```

### 工具方法

#### 获取常用货币列表

```typescript
const currencies = sdk.getCommonCurrencies();
console.log(currencies); // ['USD', 'EUR', 'CNY', 'JPY', ...]
```

#### 验证货币代码格式

```typescript
console.log(sdk.isValidCurrencyFormat('USD')); // true
console.log(sdk.isValidCurrencyFormat('us'));  // false
```

#### 格式化货币代码

```typescript
console.log(sdk.formatCurrency('usd')); // 'USD'
console.log(sdk.formatCurrency(' eur ')); // 'EUR'
```

## 🔧 高级用法

### 错误处理

```typescript
import { ExchangeRateAPIError } from '@pddo/exchange-rate-sdk';

try {
  const rate = await sdk.getExchangeRate('INVALID', 'USD');
} catch (error) {
  if (error instanceof ExchangeRateAPIError) {
    console.error('API错误:', error.message);
    console.error('状态码:', error.status);
    console.error('错误代码:', error.code);
  } else {
    console.error('未知错误:', error);
  }
}
```

### 动态配置更新

```typescript
// 更新配置
sdk.updateConfig({
  baseURL: 'https://new-api.com',
  debug: true,
  headers: {
    'Authorization': 'Bearer token'
  }
});
```

### 自定义HTTP客户端

```typescript
import { HttpClient } from '@pddo/exchange-rate-sdk';

const client = new HttpClient({
  baseURL: 'https://api.example.com',
  timeout: 5000,
  debug: true
});

// 直接使用HTTP客户端
const response = await client.get('/custom-endpoint');
```

## 📝 响应类型

### CurrencyRatesResponse
```typescript
interface CurrencyRatesResponse {
  message: string;
  data: Record<string, number>; // 货币代码 -> 汇率
}
```

### RateResponse
```typescript
interface RateResponse {
  message: string;
  data: number;           // 汇率
  base_code: string;      // 基准货币
  target_code: string;    // 目标货币
}
```

### ConversionResponse
```typescript
interface ConversionResponse {
  message: string;
  data: number;           // 转换后的金额
  rate: number;           // 使用的汇率
  base_code: string;      // 基准货币
  target_code: string;    // 目标货币
}
```

## 🌍 支持的货币

SDK支持所有ISO 4217标准的货币代码，常用货币包括：

- **主要货币**: USD, EUR, CNY, JPY, GBP, AUD, CAD, CHF
- **亚洲货币**: HKD, SGD, KRW, INR, THB, IDR, MYR, PHP
- **欧洲货币**: SEK, NOK, DKK, PLN, HUF, CZK, RON
- **其他货币**: MXN, BRL, ZAR, TRY, RUB, AED, SAR

## 🛠 开发

```bash
# 克隆仓库
git clone https://github.com/catpddo/exchange-rate.git
cd exchange-rate/sdk

# 安装依赖
bun install

# 开发模式
bun run dev

# 构建
bun run build

# 类型检查
bun run type-check
```

## 📄 许可证

MIT License - 详见 [LICENSE](../LICENSE) 文件

## 🤝 贡献

欢迎提交 Issue 和 Pull Request！

## 🔗 相关链接

- [API文档](https://github.com/catpddo/exchange-rate#readme)
- [GitHub仓库](https://github.com/catpddo/exchange-rate)
- [NPM包](https://www.npmjs.com/package/@pddo/exchange-rate-sdk)

## 📞 支持

如有问题或建议，请：

1. 查看 [API文档](https://github.com/catpddo/exchange-rate#readme)
2. 提交 [GitHub Issue](https://github.com/catpddo/exchange-rate/issues)
3. 发送邮件至 pub@pd.do 