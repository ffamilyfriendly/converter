import { Result } from './result'

/**
 * Describes a unit of measurement. For example { conversion_unit_name: "American Dollar", conversion_symbol: '$'  }
 */
export interface ConversionSymbol {
  conversion_unit_name: string
  conversion_unit_name_plural?: string
  conversion_symbol?: string
}

/**
 * A result of a conversion being done! For example (approx) { from_unit: { conversion_unit_name: "feet" }, to_unit: { conversion_unit_name: "meter" }, initial_value: 3.6, converted_value: 1 }
 */
export interface ConversionResult {
  from_unit: ConversionSymbol
  to_unit: ConversionSymbol
  initial_value: number | string
  converted_value: number | string
}

export interface ConversionHandler<> {
  handler_name: string
  requires_premium?: boolean
  base_intermediary_unit: string
  default_opposite_unit?: ConversionHandler
  sub_units: readonly string[]

  into_subunit(
    as_intermediary: number,
    subunit: string,
  ): Result<number> | Promise<Result<number>>

  into_intermediary(
    as_unit: number,
    subunit?: string,
  ): Result<number> | Promise<Result<number>>

  into_best_subunit?(
    as_intermediary: number,
  ): Result<{ unit: ConversionSymbol; value_as_unit: number | string }>

  convert?(
    data: string,
    into_unit?: string,
  ): ConversionResult[] | Promise<ConversionResult[]>
}
