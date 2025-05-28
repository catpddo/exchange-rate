/**
 * 汇率API响应的基础接口
 */
export interface BaseResponse {
  message: string;
}

/**
 * 错误响应接口
 */
export interface ErrorResponse {
  error: string;
}

/**
 * 货币转换响应接口（带金额）
 */
export interface ConversionResponse extends BaseResponse {
  data: number;
  rate: number;
  base_code: string;
  target_code: string;
}

/**
 * 汇率查询响应接口（仅汇率）
 */
export interface RateResponse extends BaseResponse {
  data: number;
  base_code: string;
  target_code: string;
}

/**
 * 获取特定基准货币汇率响应接口
 */
export interface CurrencyRatesResponse extends BaseResponse {
  data: Record<string, number>;
}

/**
 * 更新汇率响应接口
 */
export interface UpdateResponse extends BaseResponse {
  data: {
    result: string;
    conversion_rates: Record<string, number>;
    time_last_updated_unix: number;
    time_last_updated_utc: string;
    base_code: string;
  };
}

/**
 * SDK配置选项
 */
export interface ExchangeRateSDKOptions {
  /**
   * API基础URL
   * @default "https://exchange-api.pd.do"
   */
  baseURL?: string;
  
  /**
   * 请求超时时间（毫秒）
   * @default 10000
   */
  timeout?: number;
  
  /**
   * 自定义请求头
   */
  headers?: Record<string, string>;
  
  /**
   * 是否启用调试模式
   * @default false
   */
  debug?: boolean;
}

/**
 * 货币代码类型（ISO 4217）
 */
export type CurrencyCode = string;

/**
 * HTTP方法类型
 */
export type HttpMethod = 'GET' | 'POST' | 'PUT' | 'DELETE';

/**
 * 请求配置接口
 */
export interface RequestConfig {
  method: HttpMethod;
  url: string;
  headers?: Record<string, string>;
  timeout?: number;
}

/**
 * API错误类
 */
export class ExchangeRateAPIError extends Error {
  public readonly status?: number;
  public readonly code?: string;
  
  constructor(message: string, status?: number, code?: string) {
    super(message);
    this.name = 'ExchangeRateAPIError';
    this.status = status;
    this.code = code;
  }
} 