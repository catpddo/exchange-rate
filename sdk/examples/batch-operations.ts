/**
 * 批量操作示例
 * Batch Operations Example
 */

import { ExchangeRateSDK, ExchangeRateAPIError } from '../src';

async function batchOperationsExample() {
  const sdk = new ExchangeRateSDK({
    baseURL: 'https://exchange-api.pd.do',
    debug: true
  });

  try {
    console.log('=== 批量操作示例 ===\n');

    // 1. 批量获取汇率
    console.log('1. 批量获取多个货币对的汇率:');
    const ratePairs: Array<[string, string]> = [
      ['USD', 'EUR'],
      ['USD', 'CNY'],
      ['EUR', 'JPY'],
      ['GBP', 'USD'],
      ['AUD', 'CAD']
    ];

    const batchRates = await sdk.getBatchRates(ratePairs);
    
    batchRates.forEach((rate, index) => {
      const [base, target] = ratePairs[index];
      console.log(`${base} -> ${target}: ${rate.data}`);
    });
    console.log();

    // 2. 批量货币转换
    console.log('2. 批量货币转换:');
    const conversions = [
      { from: 'USD', to: 'EUR', amount: 100 },
      { from: 'EUR', to: 'CNY', amount: 50 },
      { from: 'GBP', to: 'JPY', amount: 25 },
      { from: 'AUD', to: 'USD', amount: 200 }
    ];

    const batchResults = await sdk.batchConvert(conversions);
    
    batchResults.forEach((result, index) => {
      const { from, to, amount } = conversions[index];
      console.log(`${amount} ${from} = ${result.data.toFixed(2)} ${to} (汇率: ${result.rate.toFixed(4)})`);
    });
    console.log();

    // 3. 并发处理多个不同类型的请求
    console.log('3. 并发处理多个不同类型的请求:');
    const [usdRates, eurToUsd, conversion] = await Promise.all([
      sdk.getCurrencyRates('USD'),
      sdk.getExchangeRate('EUR', 'USD'),
      sdk.convertCurrency('CNY', 'JPY', 1000)
    ]);

    console.log('USD基准汇率 (前5个):');
    const topCurrencies = ['EUR', 'CNY', 'JPY', 'GBP', 'AUD'];
    topCurrencies.forEach(currency => {
      console.log(`  ${currency}: ${usdRates.data[currency]}`);
    });

    console.log(`\nEUR到USD汇率: ${eurToUsd.data}`);
    console.log(`1000 CNY = ${conversion.data.toFixed(2)} JPY\n`);

    // 4. 错误处理示例
    console.log('4. 错误处理示例:');
    try {
      await sdk.getExchangeRate('INVALID', 'USD');
    } catch (error) {
      if (error instanceof ExchangeRateAPIError) {
        console.log(`捕获到API错误: ${error.message}`);
      }
    }

  } catch (error) {
    if (error instanceof ExchangeRateAPIError) {
      console.error('API错误:', error.message);
      console.error('状态码:', error.status);
    } else {
      console.error('未知错误:', error);
    }
  }
}

export { batchOperationsExample }; 