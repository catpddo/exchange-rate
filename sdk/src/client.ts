import {
  ExchangeRateSDKOptions,
  RequestConfig,
  ExchangeRateAPIError,
  ErrorResponse,
} from './types';

/**
 * HTTP客户端类，处理所有API请求
 */
export class HttpClient {
  private baseURL: string;
  private timeout: number;
  private headers: Record<string, string>;
  private debug: boolean;

  constructor(options: ExchangeRateSDKOptions = {}) {
    this.baseURL = options.baseURL || 'https://exchange-api.pd.do';
    this.timeout = options.timeout || 10000;
    this.headers = {
      'Content-Type': 'application/json',
      'User-Agent': '@pddo/exchange-rate-sdk/1.0.0',
      ...options.headers,
    };
    this.debug = options.debug || false;
  }

  /**
   * 发送HTTP请求
   */
  async request<T>(config: RequestConfig): Promise<T> {
    const url = `${this.baseURL}${config.url}`;
    const requestHeaders = { ...this.headers, ...config.headers };

    if (this.debug) {
      console.log(`[ExchangeRateSDK] ${config.method} ${url}`);
    }

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), this.timeout);

    try {
      const response = await fetch(url, {
        method: config.method,
        headers: requestHeaders,
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        let errorMessage = `HTTP ${response.status}: ${response.statusText}`;
        
        try {
          const errorData: ErrorResponse = await response.json();
          errorMessage = errorData.error || errorMessage;
        } catch {
          // 如果无法解析错误响应，使用默认错误消息
        }

        throw new ExchangeRateAPIError(
          errorMessage,
          response.status,
          response.status.toString()
        );
      }

      const data: T = await response.json();
      
      if (this.debug) {
        console.log(`[ExchangeRateSDK] Response:`, data);
      }

      return data;
    } catch (error) {
      clearTimeout(timeoutId);

      if (error instanceof ExchangeRateAPIError) {
        throw error;
      }

      if (error instanceof Error) {
        if (error.name === 'AbortError') {
          throw new ExchangeRateAPIError(
            `Request timeout after ${this.timeout}ms`,
            408,
            'TIMEOUT'
          );
        }
        
        throw new ExchangeRateAPIError(
          `Network error: ${error.message}`,
          0,
          'NETWORK_ERROR'
        );
      }

      throw new ExchangeRateAPIError(
        'Unknown error occurred',
        0,
        'UNKNOWN_ERROR'
      );
    }
  }

  /**
   * 发送GET请求
   */
  async get<T>(url: string, headers?: Record<string, string>): Promise<T> {
    return this.request<T>({
      method: 'GET',
      url,
      headers: headers || {},
    });
  }

  /**
   * 更新基础URL
   */
  setBaseURL(baseURL: string): void {
    this.baseURL = baseURL;
  }

  /**
   * 更新请求头
   */
  setHeaders(headers: Record<string, string>): void {
    this.headers = { ...this.headers, ...headers };
  }

  /**
   * 设置调试模式
   */
  setDebug(debug: boolean): void {
    this.debug = debug;
  }
} 