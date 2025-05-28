/**
 * @pddo/exchange-rate-sdk
 * 
 * TypeScript SDK for Exchange Rate API
 * 汇率API的TypeScript SDK
 * 
 * @author PDDO <pub@pd.do>
 * @license MIT
 */

// 导出主要类
export { ExchangeRateSDK } from './exchange-rate-sdk';
export { HttpClient } from './client';

// 导出所有类型
export type {
  BaseResponse,
  ErrorResponse,
  ConversionResponse,
  RateResponse,
  CurrencyRatesResponse,
  UpdateResponse,
  ExchangeRateSDKOptions,
  CurrencyCode,
  HttpMethod,
  RequestConfig,
} from './types';

// 导出错误类
export { ExchangeRateAPIError } from './types';

// 默认导出SDK类
export { ExchangeRateSDK as default } from './exchange-rate-sdk';

// 导入类型用于函数参数
import { ExchangeRateSDKOptions } from './types';
import { ExchangeRateSDK } from './exchange-rate-sdk';

/**
 * 创建SDK实例的便捷函数
 * @param options SDK配置选项
 * @returns ExchangeRateSDK实例
 * 
 * @example
 * ```typescript
 * import { createExchangeRateSDK } from '@pddo/exchange-rate-sdk';
 * 
 * const sdk = createExchangeRateSDK({
 *   baseURL: 'https://your-api.com',
 *   timeout: 5000,
 *   debug: true
 * });
 * ```
 */
export function createExchangeRateSDK(options?: ExchangeRateSDKOptions) {
  return new ExchangeRateSDK(options);
} 