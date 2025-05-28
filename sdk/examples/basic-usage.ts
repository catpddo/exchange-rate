/**
 * 基础用法示例
 * Basic Usage Example
 */

import { ExchangeRateSDK, ExchangeRateAPIError } from '../src';

async function basicUsageExample() {
  // 创建SDK实例
  const sdk = new ExchangeRateSDK({
    baseURL: 'https://exchange-api.pd.do',
    timeout: 10000,
    debug: true
  });

  try {
    console.log('=== 基础用法示例 ===\n');

    // 1. 获取汇率
    console.log('1. 获取USD到EUR的汇率:');
    const rate = await sdk.getExchangeRate('USD', 'EUR');
    console.log(`1 USD = ${rate.data} EUR\n`);

    // 2. 货币转换
    console.log('2. 将100美元转换为欧元:');
    const conversion = await sdk.convertCurrency('USD', 'EUR', 100);
    console.log(`100 USD = ${conversion.data} EUR`);
    console.log(`使用汇率: ${conversion.rate}\n`);

    // 3. 获取特定基准货币的所有汇率
    console.log('3. 获取以USD为基准的所有汇率:');
    const allRates = await sdk.getCurrencyRates('USD');
    console.log('主要货币汇率:');
    console.log(`EUR: ${allRates.data.EUR}`);
    console.log(`CNY: ${allRates.data.CNY}`);
    console.log(`JPY: ${allRates.data.JPY}`);
    console.log(`GBP: ${allRates.data.GBP}\n`);

    // 4. 获取常用货币列表
    console.log('4. 支持的常用货币:');
    const currencies = sdk.getCommonCurrencies();
    console.log(currencies.slice(0, 10).join(', '), '...\n');

    // 5. 验证货币代码
    console.log('5. 货币代码验证:');
    console.log(`USD 是否有效: ${sdk.isValidCurrencyFormat('USD')}`);
    console.log(`us 是否有效: ${sdk.isValidCurrencyFormat('us')}`);
    console.log(`格式化 'usd': ${sdk.formatCurrency('usd')}\n`);

  } catch (error) {
    if (error instanceof ExchangeRateAPIError) {
      console.error('API错误:', error.message);
      console.error('状态码:', error.status);
      console.error('错误代码:', error.code);
    } else {
      console.error('未知错误:', error);
    }
  }
}

// 运行示例
basicUsageExample().catch(console.error);

export { basicUsageExample }; 