import { Hono } from 'hono';
import { prettyJSON } from 'hono/pretty-json';
import { requestId } from 'hono/request-id';
import { z } from 'zod';
import { zValidator } from '@hono/zod-validator';
import currencyCodes from 'currency-codes';

interface CF_SECRET {
	PASS: string;
	API_KEY: string;
}

interface ExchangerateApiResponse {
	result: 'success' | 'error';
}

interface ExchangerateApiResponseSuccess extends ExchangerateApiResponse {
	result: 'success';
	conversion_rates: Record<string, number>;
	time_last_updated_unix: number;
	time_last_updated_utc: string;
	base_code: string;
}

interface ExchangerateApiResponseFailure extends ExchangerateApiResponse {
	result: 'error';
	'error-type': ExchangerateApiErrorType;
}

type ExchangerateApiErrorType = 'unsupported-code' | 'malformed-request' | 'invalid-key' | 'inactive-account' | 'quota-reached';

const currencyCodesSet = new Set(currencyCodes.codes());
const currencySchema = z
	.string()
	.min(1)
	.length(3)
	.toUpperCase()
	.refine((code) => currencyCodesSet.has(code), 'Invalid currency code')
	.transform((code) => code.toUpperCase());

const app = new Hono<{ Bindings: Env & CF_SECRET }>();
app.use(prettyJSON());
app.use('*', requestId());
app.notFound((c) => c.json({ error: 'Not Found' }, 404));

async function update(env: Env & CF_SECRET) {
	const url = new URL(`https://v6.exchangerate-api.com/v6/${env.API_KEY}/latest/USD`);
	const res = await fetch(url);
	const data: ExchangerateApiResponseSuccess | ExchangerateApiResponseFailure = await res.json();
	if (data.result === 'success') {
		await env.KV.put('last', JSON.stringify(data.conversion_rates));
		return {
			message: 'Update success',
			data,
		};
	} else {
		return {
			error: data['error-type'],
		};
	}
}
function translate(conversion_rates: Record<string, number>, target_currency: string) {
	const baseRate = conversion_rates[target_currency];
	if (!baseRate) {
		return null;
	}
	const result: Record<string, number> = {};
	Object.entries(conversion_rates).forEach(([currency, rate]) => {
		result[currency] = (1 / baseRate) * rate;
	});
	return result;
}
app.get(
	'/update/:pass',
	zValidator(
		'param',
		z.object({
			pass: z.string().min(1),
		})
	),
	async (c) => {
		const { pass } = c.req.valid('param');
		if (pass !== c.env.PASS) {
			return c.json({ error: 'Invalid password' }, 401);
		}

		const res = await update(c.env);
		if (res.error) {
			return c.json({ error: res.error }, 400);
		} else {
			return c.json({ message: 'Update success', data: res.data });
		}
	}
);

app.get('/encrypt', async (c) => {
	const encrypt = await c.env.KV.get(`kraken`, 'json');
	if (encrypt) {
		return c.json({ message: 'Success', ...encrypt });
	}
	try {
		const res = await fetch(`https://iapi.kraken.com/api/internal/markets/all/assets?sort_by=listing_date&quote_symbol=usd&tradable=true`, {
			headers: {
				'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
				referer: 'https://www.kraken.com/',
			},
		});
		const data: {
			result: {
				data: {
					rank: number;
					symbol: string;
					name: string;
					price: string;
					volume_24h: string;
					market_cap: string;
					change_pct_1h: string;
					change_pct_24h: string;
					change_pct_1w: string;
					change_pct_1m: string;
					change_pct_1y: string;
					tradable: boolean;
					listing_date: number;
					trending_rank: number;
					categories: string[];
				}[];
				count: number;
				count_tradable: number;
				total_results: number;
			};
			errors: string[];
		} = await res.json();
		await c.env.KV.put(`kraken`, JSON.stringify(data.result), {
			expirationTtl: 60 * 5,
		});
		return c.json({ message: 'Success', data: { ...data.result } });
	} catch (error) {
		console.error(error);
	}
});

app.get(
	'/last/:currency',
	zValidator(
		'param',
		z.object({
			currency: currencySchema,
		})
	),
	async (c) => {
		const currency = c.req.param('currency');
		let last: Record<string, number> | null = await c.env.KV.get('last', 'json');
		if (!last) {
			const res = await update(c.env);
			if (res.error) {
				return c.json({ error: res.error }, 400);
			} else {
				last = res.data.conversion_rates;
			}
		}
		if (!last[currency]) {
			return c.json({ error: 'Currency not found' }, 404);
		}
		return c.json({ message: 'Success', data: translate(last, currency) });
	}
);

app.get(
	'/:baseCurrency/:targetCurrency/:amount?',
	zValidator(
		'param',
		z.object({
			baseCurrency: currencySchema,
			targetCurrency: currencySchema,
			amount: z.number({ coerce: true }).optional(),
		})
	),
	async (c) => {
		const params = c.req.valid('param');
		const baseCurrency = params.baseCurrency;
		const targetCurrency = params.targetCurrency;
		const amount = params.amount;
		let last: Record<string, number> | null = await c.env.KV.get('last', 'json');
		if (!last) {
			const res = await update(c.env);
			if (res.error) {
				return c.json({ error: res.error }, 400);
			} else {
				last = res.data.conversion_rates;
			}
		}

		// 检查两个货币是否都存在
		if (!last[baseCurrency]) {
			return c.json({ error: `Base currency ${baseCurrency} not found` }, 404);
		}
		if (!last[targetCurrency]) {
			return c.json({ error: `Target currency ${targetCurrency} not found` }, 404);
		}

		// 计算汇率：从baseCurrency到targetCurrency
		// 由于last是以USD为基准的汇率，需要进行转换
		// 公式：rate = (1 USD / baseCurrency rate) * (targetCurrency rate / 1 USD)
		//      = targetCurrency rate / baseCurrency rate
		const rate = last[targetCurrency] / last[baseCurrency];

		if (amount) {
			return c.json({
				message: 'Success',
				data: rate * amount,
				rate: rate,
				base_code: baseCurrency,
				target_code: targetCurrency,
			});
		}
		return c.json({
			message: 'Success',
			data: rate,
			base_code: baseCurrency,
			target_code: targetCurrency,
		});
	}
);

export default {
	fetch: app.fetch,
	scheduled: async (batch, env) => {
		const res = await update(env as Env & CF_SECRET);
		if (res.error) {
			console.error(res.error);
		}
	},
} satisfies ExportedHandler<Env>;
