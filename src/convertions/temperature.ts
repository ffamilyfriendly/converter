import {
  ConversionHandler,
  ConversionResult,
  ConversionSymbol,
} from '../interfaces/convertions'
import { Ok, Result, Yolo } from '../interfaces/result'

// We can safely assume that whenever a temperature is sent without unit indicator it's probably sent by an american
const FAHRENHEIT_REGEX = /(?<value>[0-9,.,-]+)( |)(f|°f|fahrenheit|°) /gm
const CELCIUS_REGEX = /(?<value>[0-9,.,-]+)( |)(c|°c|celcius) /gm

export class Celcius implements ConversionHandler {
  handler_name = 'celcius'
  base_intermediary_unit = 'kelvin'
  sub_units = ['celcius']
  default_opposite_unit?: ConversionHandler | undefined

  constructor(default_opposite?: ConversionHandler) {
    this.default_opposite_unit = default_opposite
  }

  into_subunit(
    as_intermediary: number,
    subunit: string,
  ): Result<number> | Promise<Result<number>> {
    return Ok(as_intermediary - 273.15)
  }

  into_best_subunit(
    as_intermediary: number,
  ): Result<{ unit: ConversionSymbol; value_as_unit: number | string }> {
    return Ok({
      unit: {
        conversion_unit_name: 'celcius',
      },
      value_as_unit: Yolo(this.into_subunit(as_intermediary, 'c')),
    })
  }

  into_intermediary(as_unit: number): Result<number> | Promise<Result<number>> {
    return Ok(as_unit + 273.15)
  }

  convert(data: string): ConversionResult[] {
    let return_values: ConversionResult[] = []

    if (!this.default_opposite_unit?.into_best_subunit) return []

    for (const match of data.matchAll(CELCIUS_REGEX)) {
      const value = match.groups?.['value'] || ''
      const as_kelvin = Yolo(this.into_intermediary(Number.parseFloat(value)))

      const as_fahrenheit = Yolo(
        this.default_opposite_unit.into_best_subunit(as_kelvin),
      )

      return_values.push({
        from_unit: {
          conversion_unit_name: 'celcius',
        },
        to_unit: as_fahrenheit.unit,
        converted_value: as_fahrenheit.value_as_unit,
        initial_value: value,
      })
    }

    return return_values
  }
}

export class Fahrenheit implements ConversionHandler {
  handler_name = 'fahrenheit'
  base_intermediary_unit = 'kelvin'
  sub_units = ['f']
  default_opposite_unit

  constructor(default_opposite?: ConversionHandler) {
    this.default_opposite_unit = default_opposite
  }

  into_subunit(
    as_intermediary: number,
    subunit: string,
  ): Result<number> | Promise<Result<number>> {
    return Ok(as_intermediary * (9 / 5) - 459.67)
  }

  into_best_subunit(
    as_intermediary: number,
  ): Result<{ unit: ConversionSymbol; value_as_unit: number | string }> {
    return Ok({
      unit: {
        conversion_unit_name: 'fahrenheit',
      },
      value_as_unit: Yolo(this.into_subunit(as_intermediary, 'f')),
    })
  }

  into_intermediary(
    fahrenheit: number,
    subinit?: string,
  ): Result<number> | Promise<Result<number>> {
    return Ok((fahrenheit + 459.67) * (5 / 9))
  }

  convert(data: string): ConversionResult[] {
    let return_values: ConversionResult[] = []

    if (!this.default_opposite_unit?.into_best_subunit) return []

    for (const match of data.matchAll(FAHRENHEIT_REGEX)) {
      const value = match.groups?.['value'] || ''
      const as_kelvin = Yolo(this.into_intermediary(Number.parseFloat(value)))

      const as_celcius = Yolo(
        this.default_opposite_unit.into_best_subunit(as_kelvin),
      )

      return_values.push({
        from_unit: {
          conversion_unit_name: 'fahrenheit',
        },
        to_unit: as_celcius.unit,
        converted_value: as_celcius.value_as_unit,
        initial_value: value,
      })
    }

    return return_values
  }
}
