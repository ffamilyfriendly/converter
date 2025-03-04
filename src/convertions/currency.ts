import { ConversionHandler, ConversionResult } from '../interfaces/convertions'
import { Result } from '../interfaces/result'

// main: https://cdn.jsdelivr.net/npm/@fawazahmed0/currency-api@latest/v1/currencies/eur.json
// fallback: https://latest.currency-api.pages.dev/v1/currencies/eur.json

const MAIN_API =
  'https://cdn.jsdelivr.net/npm/@fawazahmed0/currency-api@latest/v1/currencies/eur.json'
const BACKUP_API =
  'https://latest.currency-api.pages.dev/v1/currencies/eur.json'

const CURRENCY_REGEX = /(?<value>[0-9,.]+)( |)(?<currency>[a-z]{1,5})/gm
const CURRENCY_NORMALIZER_REGEX = /([0-9,.]+)(\D) | (\D)([0-9,.]+)/gm

interface currency_list_object {
  date: string
  eur: {
    [index: string]: number
  }
}

let currency_cache: currency_list_object

export async function fetch_currency_list(
  route = MAIN_API,
): Promise<Result<currency_list_object>> {
  if (currency_cache) {
    const as_date = new Date(currency_cache.date)
    const current_date = new Date()

    // We're checking the current date (day of month) to establish wheter or not the data is up to date
    // this might cause issues if the function is not called in a month.
    // example: first called on feb 10th then again called on march 10th without any usage between.
    // this is not going to happen because: 1. the cache dies at any downtime whatsoever, 2: we can safely assume the function will get called more often than once per month
    if (as_date.getDate() === current_date.getDate()) {
      return { ok: true, data: currency_cache }
    }
  }

  try {
    const data = (await (await fetch(route)).json()) as currency_list_object
    currency_cache = data
    return { ok: true, data }
  } catch (e: unknown) {
    let error_message = 'something went wrong'
    if (e instanceof Error) {
      error_message = e.message
    }

    if (route === BACKUP_API) {
      return { ok: false, data: { message: error_message } }
    } else {
      return fetch_currency_list(BACKUP_API)
    }
  }
}

const SYMBOL_TO_CURRENCY_NAME: { [index: string]: string } = {
  $: 'usd',
  '£': 'gbp',
  '€': 'eur',
  '₽': 'rub',
}

const CURRENCY_NAME_TO_SYMBOL: { [index: string]: string } = Object.fromEntries(
  Object.entries(SYMBOL_TO_CURRENCY_NAME).map(([symbol, currency]) => [
    currency,
    symbol,
  ]),
)

function normalize_symbols_to_currency_names(
  match: string,
  number_1?: string,
  symbol_1?: string,
  symbol_2?: string,
  number_2?: string,
): string {
  const number = number_1 || number_2
  const symbol = symbol_1 || symbol_2 || ''

  if (SYMBOL_TO_CURRENCY_NAME[symbol]) {
    return `${number}${SYMBOL_TO_CURRENCY_NAME[symbol]}`
  } else return match
}

function currency_name_to_symbol(name: string): string {
  return CURRENCY_NAME_TO_SYMBOL[name] || name
}

export async function get_currency_converted(
  value: number,
  from: string,
  to: string,
): Promise<Result<number>> {
  const data = await fetch_currency_list()
  if (!data.ok) return data

  const rates_eur = data.data.eur

  if (!rates_eur[from] || !rates_eur[to]) {
    return {
      ok: false,
      data: { message: `Invalid currency code: ${from} or ${to}` },
    }
  }

  const value_as_eur = value / rates_eur[from]
  const rate_as_selected = value_as_eur * rates_eur[to]

  return { ok: true, data: rate_as_selected }
}

export default class Currency implements ConversionHandler {
  handler_name = 'currency'
  base_intermediary_unit = 'eur'
  sub_units: readonly string[]

  constructor() {
    this.sub_units = []
    fetch_currency_list().then(value => {
      if (value.ok) {
        this.sub_units = Object.keys(value.data.eur)
      }
    })
  }

  into_subunit(
    as_intermediary: number,
    subunit: string,
  ): Result<number> | Promise<Result<number>> {
    if (!this.sub_units.includes(subunit))
      return { ok: false, data: { message: 'subunit not supported' } }
    return get_currency_converted(as_intermediary, 'eur', subunit)
  }

  into_intermediary(
    as_unit: number,
    subinit?: string,
  ): Result<number> | Promise<Result<number>> {
    if (!subinit || !this.sub_units.includes(subinit))
      return { ok: false, data: { message: 'subunit not supported' } }
    return get_currency_converted(as_unit, subinit, 'eur')
  }

  async currency_to_currency(
    matches: RegExpStringIterator<RegExpExecArray>,
    convert_to: string,
  ): Promise<ConversionResult[]> {
    let return_values: ConversionResult[] = []
    for (const match of matches) {
      const value = match.groups?.['value'] || ''
      const currency_from = match.groups?.['currency'] || ''

      const res = await get_currency_converted(
        Number.parseFloat(value),
        currency_from,
        convert_to,
      )

      if (res.ok) {
        return_values.push({
          from_unit: {
            conversion_unit_name: currency_from,
            conversion_unit_name_plural: currency_from,
          },
          to_unit: {
            conversion_unit_name: convert_to,
            conversion_unit_name_plural: convert_to,
          },
          initial_value: value,
          converted_value: res.data,
        })
      }
    }
    return return_values
  }

  async convert(data: string, into_unit?: string): Promise<ConversionResult[]> {
    data = data.replace(
      CURRENCY_NORMALIZER_REGEX,
      normalize_symbols_to_currency_names,
    )

    if (!into_unit) {
      console.error(
        "convert() was called on Currency converter without 'into_unit' having a value",
      )
      return []
    }

    return await this.currency_to_currency(
      data.matchAll(CURRENCY_REGEX),
      into_unit,
    )
  }
}
