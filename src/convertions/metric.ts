import {
  ConversionHandler,
  ConversionResult,
  ConversionSymbol,
} from '../interfaces/convertions'
import { Ok, Result, Yolo } from '../interfaces/result'
import { ImperialLength, ImperialSpeed } from './imperial'

const METRIC_REGEX = /(?<value>[0-9,.]+)( |)(?<unit>(\w+|)meter(s|)|(\w|)m) /gm

export class MetricLength implements ConversionHandler {
  handler_name = 'metric'

  base_intermediary_unit = 'millimeter'
  sub_units = ['millimeter', 'centimeter', 'decimeter', 'meter', 'kilometer']
  default_opposite_unit?: ConversionHandler | undefined

  constructor(default_opposite?: ConversionHandler) {
    this.default_opposite_unit = default_opposite
  }

  into_subunit(as_intermediary: number, subunit: string): Result<number> {
    if (!this.sub_units.includes(subunit))
      return { ok: false, data: { message: 'subunit not supported' } }
    let result = as_intermediary

    switch (subunit) {
      case 'centimeter':
        result = as_intermediary / 10
        break
      case 'decimeter':
        result = as_intermediary / 100
        break
      case 'meter':
        result = as_intermediary / 1000
        break
      case 'kilometer':
        result = as_intermediary / 1_000_000
        break
    }

    return { ok: true, data: result }
  }

  into_best_subunit(len_in_millimeters: number): Result<{
    unit: ConversionSymbol
    value_as_unit: number
  }> {
    const units_list = [
      { unit: 'kilometer', factor: 0.000001 },
      { unit: 'meter', factor: 0.001 },
      { unit: 'decimeter', factor: 0.01 },
      { unit: 'centimeter', factor: 0.1 },
    ]

    for (const unit of units_list) {
      const as_unit = len_in_millimeters * unit.factor
      if (as_unit > 1)
        return Ok({
          unit: {
            conversion_unit_name: unit.unit,
            conversion_unit_name_plural: unit.unit + 's',
          },
          value_as_unit: as_unit,
        })
    }
    return Ok({
      unit: {
        conversion_unit_name: 'millimeter',
        conversion_unit_name_plural: 'millimeters',
      },
      value_as_unit: len_in_millimeters,
    })
  }

  into_intermediary(
    value: number,
    unit: string,
  ): Result<number> | Promise<Result<number>> {
    let unit_as_mm = 0

    if (unit === 'm' || unit.startsWith('meter')) {
      unit_as_mm = value * 1000
    } else if (unit[0] === 'm') {
      // millimeters
      unit_as_mm = value
    } else if (unit[0] === 'c') {
      unit_as_mm = value * 10
    } else if (unit[0] === 'd') {
      unit_as_mm = value * 100
    } else if (unit[0] === 'k') {
      unit_as_mm = value * 1_000_000
    }

    return Ok(unit_as_mm)
  }

  metric_to_millimeters(match: RegExpExecArray) {
    const value = Number.parseFloat(match.groups?.['value'] || '')
    const unit = match.groups?.['unit'] || ''

    return Yolo(this.into_intermediary(value, unit))
  }

  convert(data: string): ConversionResult[] {
    const conversion_results: ConversionResult[] = []

    if (!this.default_opposite_unit?.into_best_subunit) return []

    for (const whatever of data.matchAll(METRIC_REGEX)) {
      const value = whatever.groups?.['value'] || ''
      const unit = whatever.groups?.['unit'] || ''
      const as_mm = this.metric_to_millimeters(whatever)

      const as_imperial = this.default_opposite_unit.into_best_subunit(as_mm)

      if (as_imperial.ok) {
        conversion_results.push({
          from_unit: {
            conversion_unit_name: unit,
          },
          to_unit: as_imperial.data.unit,
          converted_value: as_imperial.data.value_as_unit,
          initial_value: value,
        })
      }
    }

    return conversion_results
  }
}

//const MILES_PER_HOUR_REGEX = /(?<value>[0-9,.]+)( |)(mph|mi\/h) /gm
const KM_PER_HOUR_REGEX = /(?<value>[0-9,.]+)( |)(kmh|km\/h) /gm
const KM_PER_SECOND_REGEX = /(?<value>[0-9,.]+)( |)(km\/s) /gm
const M_PER_SECOND_REGEX = /(?<value>[0-9,.]+)( |)(m\/s) /gm

const MPS_TO_KMH_FACTOR = 3.6
const MPS_TO_KMS_FACTOR = 0.001

export class MetricSpeed implements ConversionHandler {
  handler_name = 'imperial'
  base_intermediary_unit = 'm/s'
  sub_units = ['m/s', 'km/h', 'km/s']
  default_opposite_unit?: ConversionHandler | undefined

  constructor(default_opposite?: ConversionHandler) {
    this.default_opposite_unit = default_opposite
  }

  into_subunit(
    as_intermediary: number,
    subunit: string,
  ): Result<number> | Promise<Result<number>> {
    if (!this.sub_units.includes(subunit))
      return { ok: false, data: { message: 'subunit not supported' } }

    let as_unit = 0

    switch (subunit) {
      case 'm/s':
        as_unit = as_intermediary
        break
      case 'km/h':
        as_unit = as_intermediary * MPS_TO_KMH_FACTOR
        break
      case 'km/s':
        as_unit = as_intermediary * MPS_TO_KMS_FACTOR
        break
    }

    return Ok(as_unit)
  }

  into_best_subunit(
    as_intermediary: number,
  ): Result<{ unit: ConversionSymbol; value_as_unit: number | string }> {
    const AS_KMS = as_intermediary * MPS_TO_KMS_FACTOR

    // We're going REALLY damn fast.. Maybe NASA has a discord server in need of this.
    if (AS_KMS > 0.1) {
      return Ok({
        unit: {
          conversion_unit_name: 'km/s',
        },
        value_as_unit: AS_KMS,
      })
    }

    const AS_KMH = as_intermediary * MPS_TO_KMH_FACTOR
    if (AS_KMH > 1) {
      return Ok({
        unit: {
          conversion_unit_name: 'km/h',
        },
        value_as_unit: AS_KMH,
      })
    }

    return Ok({
      unit: {
        conversion_unit_name: 'm/s',
      },
      value_as_unit: as_intermediary,
    })
  }

  into_intermediary(
    as_unit: number,
    subinit: string,
  ): Result<number> | Promise<Result<number>> {
    let return_value = 0
    switch (subinit) {
      case 'm/s':
        return_value = as_unit
        break
      case 'km/h':
        return_value = as_unit / MPS_TO_KMH_FACTOR
        break
      case 'km/s':
        return_value = as_unit / MPS_TO_KMS_FACTOR
    }

    return Ok(return_value)
  }

  convert(data: string): ConversionResult[] | Promise<ConversionResult[]> {
    let return_value: ConversionResult[] = []

    if (!this.default_opposite_unit?.into_best_subunit) return []

    for (const match of data.matchAll(M_PER_SECOND_REGEX)) {
      const value = match.groups?.['value'] || ''
      const as_mps = Number.parseFloat(value)

      const as_imperial = this.default_opposite_unit.into_best_subunit(as_mps)
      if (as_imperial.ok) {
        return_value.push({
          from_unit: {
            conversion_unit_name: 'm/s',
          },
          to_unit: as_imperial.data.unit,
          converted_value: as_imperial.data.value_as_unit,
          initial_value: value,
        })
      }
    }

    for (const match of data.matchAll(KM_PER_HOUR_REGEX)) {
      const value = match.groups?.['value'] || ''
      const as_mps = Yolo(
        this.into_intermediary(Number.parseFloat(value), 'km/h'),
      )

      const as_imperial = this.default_opposite_unit.into_best_subunit(as_mps)
      if (as_imperial.ok) {
        return_value.push({
          from_unit: {
            conversion_unit_name: 'km/h',
          },
          to_unit: as_imperial.data.unit,
          converted_value: as_imperial.data.value_as_unit,
          initial_value: value,
        })
      }
    }

    for (const match of data.matchAll(KM_PER_SECOND_REGEX)) {
      const value = match.groups?.['value'] || ''
      const as_mps = Yolo(
        this.into_intermediary(Number.parseFloat(value), 'km/s'),
      )

      const as_imperial = this.default_opposite_unit.into_best_subunit(as_mps)
      if (as_imperial.ok) {
        return_value.push({
          from_unit: {
            conversion_unit_name: 'km/s',
          },
          to_unit: as_imperial.data.unit,
          converted_value: as_imperial.data.value_as_unit,
          initial_value: value,
        })
      }
    }

    return return_value
  }
}
