import { HttpClient } from './client';
import {
  ExchangeRateSDKOptions,
  CurrencyCode,
  ConversionResponse,
  RateResponse,
  CurrencyRatesResponse,
  UpdateResponse,
} from './types';

/**
 * 汇率API SDK主类
 */
export class ExchangeRateSDK {
  private client: HttpClient;

  /**
   * 创建ExchangeRateSDK实例
   * @param options SDK配置选项
   */
  constructor(options: ExchangeRateSDKOptions = {}) {
    this.client = new HttpClient(options);
  }

  /**
   * 获取特定基准货币的所有汇率
   * @param currency 基准货币代码（如：USD, EUR, CNY）
   * @returns 以指定货币为基准的所有汇率
   * 
   * @example
   * ```typescript
   * const rates = await sdk.getCurrencyRates('USD');
   * console.log(rates.data.EUR); // 美元对欧元的汇率
   * ```
   */
  async getCurrencyRates(currency: CurrencyCode): Promise<CurrencyRatesResponse> {
    return this.client.get<CurrencyRatesResponse>(`/last/${currency.toUpperCase()}`);
  }

  /**
   * 获取两种货币之间的汇率
   * @param baseCurrency 基准货币代码
   * @param targetCurrency 目标货币代码
   * @returns 汇率信息
   * 
   * @example
   * ```typescript
   * const rate = await sdk.getExchangeRate('USD', 'EUR');
   * console.log(rate.data); // 美元对欧元的汇率
   * ```
   */
  async getExchangeRate(
    baseCurrency: CurrencyCode,
    targetCurrency: CurrencyCode
  ): Promise<RateResponse> {
    return this.client.get<RateResponse>(
      `/${baseCurrency.toUpperCase()}/${targetCurrency.toUpperCase()}`
    );
  }

  /**
   * 进行货币转换
   * @param baseCurrency 基准货币代码
   * @param targetCurrency 目标货币代码
   * @param amount 转换金额
   * @returns 转换结果，包含转换后的金额和汇率
   * 
   * @example
   * ```typescript
   * const result = await sdk.convertCurrency('USD', 'EUR', 100);
   * console.log(result.data); // 100美元转换为欧元的金额
   * console.log(result.rate); // 使用的汇率
   * ```
   */
  async convertCurrency(
    baseCurrency: CurrencyCode,
    targetCurrency: CurrencyCode,
    amount: number
  ): Promise<ConversionResponse> {
    if (amount <= 0) {
      throw new Error('Amount must be greater than 0');
    }

    return this.client.get<ConversionResponse>(
      `/${baseCurrency.toUpperCase()}/${targetCurrency.toUpperCase()}/${amount}`
    );
  }

  /**
   * 手动更新汇率数据（需要密码）
   * @param password 更新密码
   * @returns 更新结果
   * 
   * @example
   * ```typescript
   * const result = await sdk.updateRates('your-password');
   * console.log(result.message); // 更新状态消息
   * ```
   */
  async updateRates(password: string): Promise<UpdateResponse> {
    if (!password) {
      throw new Error('Password is required for updating rates');
    }

    return this.client.get<UpdateResponse>(`/update/${password}`);
  }

  /**
   * 批量获取多个货币对的汇率
   * @param pairs 货币对数组，每个元素为 [基准货币, 目标货币]
   * @returns 所有货币对的汇率
   * 
   * @example
   * ```typescript
   * const rates = await sdk.getBatchRates([
   *   ['USD', 'EUR'],
   *   ['USD', 'CNY'],
   *   ['EUR', 'JPY']
   * ]);
   * ```
   */
  async getBatchRates(
    pairs: Array<[CurrencyCode, CurrencyCode]>
  ): Promise<Array<RateResponse>> {
    const promises = pairs.map(([base, target]) =>
      this.getExchangeRate(base, target)
    );
    
    return Promise.all(promises);
  }

  /**
   * 批量进行货币转换
   * @param conversions 转换配置数组
   * @returns 所有转换结果
   * 
   * @example
   * ```typescript
   * const results = await sdk.batchConvert([
   *   { from: 'USD', to: 'EUR', amount: 100 },
   *   { from: 'EUR', to: 'CNY', amount: 50 },
   * ]);
   * ```
   */
  async batchConvert(
    conversions: Array<{
      from: CurrencyCode;
      to: CurrencyCode;
      amount: number;
    }>
  ): Promise<Array<ConversionResponse>> {
    const promises = conversions.map(({ from, to, amount }) =>
      this.convertCurrency(from, to, amount)
    );
    
    return Promise.all(promises);
  }

  /**
   * 获取支持的货币列表（常用货币）
   * @returns 常用货币代码数组
   */
  getCommonCurrencies(): CurrencyCode[] {
    return [
      'USD', 'EUR', 'CNY', 'JPY', 'GBP', 'AUD', 'CAD', 'CHF',
      'HKD', 'SGD', 'SEK', 'KRW', 'NOK', 'MXN', 'INR', 'RUB',
      'ZAR', 'TRY', 'BRL', 'TWD', 'DKK', 'PLN', 'THB', 'IDR',
      'HUF', 'CZK', 'ILS', 'CLP', 'PHP', 'AED', 'COP', 'SAR',
      'MYR', 'RON'
    ];
  }

  /**
   * 验证货币代码格式
   * @param currency 货币代码
   * @returns 是否为有效格式
   */
  isValidCurrencyFormat(currency: string): boolean {
    return /^[A-Z]{3}$/.test(currency);
  }

  /**
   * 格式化货币代码
   * @param currency 货币代码
   * @returns 格式化后的货币代码
   */
  formatCurrency(currency: string): CurrencyCode {
    return currency.toUpperCase().trim();
  }

  /**
   * 更新SDK配置
   * @param options 新的配置选项
   */
  updateConfig(options: Partial<ExchangeRateSDKOptions>): void {
    if (options.baseURL) {
      this.client.setBaseURL(options.baseURL);
    }
    if (options.headers) {
      this.client.setHeaders(options.headers);
    }
    if (typeof options.debug === 'boolean') {
      this.client.setDebug(options.debug);
    }
  }
} 