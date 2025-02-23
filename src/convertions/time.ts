import {
  ConversionHandler,
  ConversionResult,
  ConversionSymbol,
} from '../interfaces/convertions'
import { Ok, Result } from '../interfaces/result'

const NORMAL_TIME_REGEX = /(?<hour>\d{2}):(?<minutes>\d{2}) /gm

export class NormalTime implements ConversionHandler {
  handler_name = 'World Time Format'
  base_intermediary_unit = 'timestamp'
  sub_units = ['time']
  default_opposite_unit?: ConversionHandler | undefined

  constructor(opposite?: ConversionHandler) {
    this.default_opposite_unit = opposite
  }

  into_subunit(
    as_intermediary: number,
    subunit: string,
  ): Result<number> | Promise<Result<number>> {
    return Ok(as_intermediary)
  }

  into_intermediary(
    as_unit: number,
    subunit?: string,
  ): Result<number> | Promise<Result<number>> {
    return Ok(as_unit)
  }

  into_best_subunit(
    as_intermediary: number,
  ): Result<{ unit: ConversionSymbol; value_as_unit: number | string }> {
    const as_time = new Date(as_intermediary)

    return Ok({
      unit: {
        conversion_unit_name: '24h time',
      },
      value_as_unit: `${as_time.getHours().toString().padStart(2, '0')}:${as_time.getMinutes().toString().padStart(2, '0')}`,
    })
  }

  convert(
    data: string,
    into_unit?: string,
  ): ConversionResult[] | Promise<ConversionResult[]> {
    if (!this.default_opposite_unit?.into_best_subunit) return []
    let converted_values: ConversionResult[] = []

    for (const match of data.matchAll(NORMAL_TIME_REGEX)) {
      const hour = Number.parseInt(match.groups?.['hour'] || '')
      const minutes = Number.parseInt(match.groups?.['minutes'] || '')

      if (hour > 24 || minutes > 60) continue

      const date = new Date()
      date.setHours(hour)
      date.setMinutes(minutes)

      const as_12h_time = this.default_opposite_unit.into_best_subunit(
        date.getTime(),
      )

      if (as_12h_time.ok) {
        converted_values.push({
          to_unit: as_12h_time.data.unit,
          from_unit: { conversion_unit_name: '24h time' },
          initial_value: match[0],
          converted_value: as_12h_time.data.value_as_unit,
        })
      }
    }

    return converted_values
  }
}

const AMERICAN_TIME_REGEX =
  /(?<hour>\d{1,2})(:(?<minutes>\d{2})|)( |)(?<when>am|pm) /gm

export class AmericanTime implements ConversionHandler {
  handler_name = 'U.S Time Format'
  base_intermediary_unit = 'timestamp'
  sub_units = ['time']
  default_opposite_unit?: ConversionHandler | undefined

  constructor(opposite?: ConversionHandler) {
    this.default_opposite_unit = opposite
  }

  into_subunit(
    as_intermediary: number,
    subunit: string,
  ): Result<number> | Promise<Result<number>> {
    return Ok(as_intermediary)
  }

  into_intermediary(
    as_unit: number,
    subunit?: string,
  ): Result<number> | Promise<Result<number>> {
    return Ok(as_unit)
  }

  into_best_subunit(
    as_intermediary: number,
  ): Result<{ unit: ConversionSymbol; value_as_unit: number | string }> {
    const as_time = new Date(as_intermediary)
    const as_timestring = new Intl.DateTimeFormat('en-US', {
      hour: 'numeric',
      minute: 'numeric',
    }).format(as_time)

    return Ok({
      unit: {
        conversion_unit_name: '12h time',
      },
      value_as_unit: as_timestring,
    })
  }

  convert(
    data: string,
    into_unit?: string,
  ): ConversionResult[] | Promise<ConversionResult[]> {
    if (!this.default_opposite_unit?.into_best_subunit) return []
    let converted_values: ConversionResult[] = []

    for (const match of data.matchAll(AMERICAN_TIME_REGEX)) {
      const is_pm = match.groups?.['when'] == 'pm'
      let hour = Number.parseInt(match.groups?.['hour'] || '')
      const minutes = Number.parseInt(match.groups?.['minutes'] || '0')

      if (hour > 12 || minutes > 60) continue
      if (is_pm) hour += 12

      const date = new Date()
      date.setHours(hour)
      date.setMinutes(minutes)

      const as_24h_time = this.default_opposite_unit.into_best_subunit(
        date.getTime(),
      )

      if (as_24h_time.ok) {
        converted_values.push({
          to_unit: as_24h_time.data.unit,
          from_unit: { conversion_unit_name: '12h time' },
          initial_value: match[0],
          converted_value: as_24h_time.data.value_as_unit,
        })
      }
    }

    return converted_values
  }
}
