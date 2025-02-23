import {
  ConversionHandler,
  ConversionResult,
  ConversionSymbol,
} from '../interfaces/convertions'
import { Ok, Result, Unwrap, Yolo } from '../interfaces/result'
import { MetricLength } from './metric'

const FEET_REGEX =
  /(?<valueCombined>[0-9,.]+'[0-9,.]+)|((?<value>[0-9,.]+)( |)(feet|foot|ft)) /gm
const INCHES_REGEX = /(?<value>[0-9,.]+)(| )(inches|inch) /gm
const YARD_REGEX = /(?<value>[0-9,.]+)( |)(yards|yard|yd) /gm
const MILES_REGEX = /(?<value>[0-9,.]+)( |)(miles|mile|mi) /gm

const MILLIMETERS_PER_FEET = 304.8
const MILLIMETERS_PER_INCH = 25.4
const MILLIMETERS_PER_YARD = 914.4
const MILLIMETERS_PER_MILE = 1.609344e6

export class ImperialLength implements ConversionHandler {
  handler_name = 'imperial'
  base_intermediary_unit = 'millimeter'
  sub_units = ['inch', 'feet', 'yard', 'mile']
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

    let as_subunit = 0

    switch (subunit) {
      case 'inch':
        as_subunit = as_intermediary * MILLIMETERS_PER_INCH
        break
      case 'feet':
        as_subunit = as_intermediary * MILLIMETERS_PER_FEET
        break
      case 'yard':
        as_subunit = as_intermediary * MILLIMETERS_PER_YARD
        break
      case 'mile':
        as_subunit = as_intermediary * MILLIMETERS_PER_MILE
        break
    }

    return Ok(as_subunit)
  }

  feet_to_millimeters(matched: RegExpExecArray): number {
    // value containing both feet and inches in the 6'5 style
    const combined_value = matched.groups?.['valueCombined']
    // value combining just feetsies in the i am 3 feet type style
    const direct_value = matched.groups?.['value']
    let as_millis = 0

    if (direct_value) {
      as_millis = Number.parseFloat(direct_value) * MILLIMETERS_PER_FEET
    } else if (combined_value) {
      const [feet, inches] = combined_value.split("'").map(part => part.trim())
      const feet_as_millis = Number.parseFloat(feet) * MILLIMETERS_PER_FEET
      const inches_as_millis = Number.parseFloat(inches) * MILLIMETERS_PER_INCH

      as_millis = feet_as_millis + inches_as_millis
    }

    return as_millis
  }

  into_best_subunit(as_mm: number): Result<{
    unit: ConversionSymbol
    value_as_unit: number | string
  }> {
    if (as_mm >= MILLIMETERS_PER_MILE * 0.1) {
      return Ok({
        unit: {
          conversion_unit_name: 'mile',
          conversion_unit_name_plural: 'miles',
        },
        value_as_unit: as_mm / MILLIMETERS_PER_MILE,
      })
    }

    if (as_mm >= MILLIMETERS_PER_YARD * 3) {
      // Use yards for medium distances
      return Ok({
        unit: {
          conversion_unit_name: 'yard',
          conversion_unit_name_plural: 'yards',
        },
        value_as_unit: as_mm / MILLIMETERS_PER_YARD,
      })
    }

    if (as_mm >= MILLIMETERS_PER_FEET * 3) {
      const as_feet = Math.floor(as_mm / MILLIMETERS_PER_FEET)
      const remaining_inches =
        (as_mm % MILLIMETERS_PER_FEET) / MILLIMETERS_PER_INCH

      return Ok({
        unit: {
          conversion_unit_name: 'feet & inches',
          conversion_unit_name_plural: 'feet & inches',
        },
        value_as_unit: `${as_feet}'${remaining_inches.toFixed(1)}`,
      })
    }

    return Ok({
      unit: {
        conversion_unit_name: 'inch',
        conversion_unit_name_plural: 'inches',
      },
      value_as_unit: as_mm / MILLIMETERS_PER_INCH,
    })
  }

  as_conversion_result(
    value_as_unit: number | string,
    value_original: number | string,
    converted_unit: ConversionSymbol,
    from_unit: string,
    from_unit_plural?: string,
  ): ConversionResult {
    return {
      from_unit: {
        conversion_unit_name: from_unit,
        conversion_unit_name_plural: from_unit_plural,
      },
      to_unit: converted_unit,
      converted_value: value_as_unit,
      initial_value: value_original,
    }
  }

  into_intermediary(
    as_unit: number,
    subinit?: string,
  ): Result<number> | Promise<Result<number>> {
    let return_value = 0

    switch (subinit) {
      case 'feet':
        return_value = as_unit * MILLIMETERS_PER_FEET
        break
      case 'inch':
        return_value = as_unit / MILLIMETERS_PER_INCH
        break
      case 'yard':
        return_value = as_unit / MILLIMETERS_PER_YARD
        break
      case 'mile':
        return_value = as_unit / MILLIMETERS_PER_MILE
        break
    }

    return Ok(return_value)
  }

  convert(data: string): ConversionResult[] | Promise<ConversionResult[]> {
    let return_array: ConversionResult[] = []

    if (!this.default_opposite_unit?.into_best_subunit) return []

    for (const match of data.matchAll(FEET_REGEX)) {
      const original =
        match.groups?.['valueCombined'] || match.groups?.['value'] || ''
      const as_millis = this.feet_to_millimeters(match)
      const as_metric = this.default_opposite_unit.into_best_subunit(as_millis)

      if (as_metric.ok) {
        return_array.push(
          this.as_conversion_result(
            as_metric.data.value_as_unit,
            original,
            as_metric.data.unit,
            'foot',
            'feet',
          ),
        )
      }
    }

    for (const match of data.matchAll(INCHES_REGEX)) {
      const value = match.groups?.['value'] || ''
      const as_millis = Yolo(this.into_intermediary(Number.parseFloat(value)))
      const as_metric = this.default_opposite_unit.into_best_subunit(as_millis)

      if (as_metric.ok) {
        return_array.push(
          this.as_conversion_result(
            as_metric.data.value_as_unit,
            value,
            as_metric.data.unit,
            'inch',
            'inches',
          ),
        )
      }
    }

    for (const match of data.matchAll(YARD_REGEX)) {
      const value = match.groups?.['value'] || ''
      const as_millis = Yolo(this.into_intermediary(Number.parseFloat(value)))
      const as_metric = this.default_opposite_unit.into_best_subunit(as_millis)

      if (as_metric.ok) {
        return_array.push(
          this.as_conversion_result(
            as_metric.data.value_as_unit,
            value,
            as_metric.data.unit,
            'yard',
          ),
        )
      }
    }

    for (const match of data.matchAll(MILES_REGEX)) {
      const value = match.groups?.['value'] || ''
      const as_millis = Yolo(this.into_intermediary(Number.parseFloat(value)))
      const as_metric = this.default_opposite_unit.into_best_subunit(as_millis)

      if (as_metric.ok) {
        return_array.push(
          this.as_conversion_result(
            as_metric.data.value_as_unit,
            value,
            as_metric.data.unit,
            'mile',
          ),
        )
      }
    }

    return return_array
  }
}

const MI_PER_HOUR_REGEX = /(?<value>[0-9,.]+)( |)(mph|mi\/h) /gm
const MPS_TO_MIH_FACTOR = 2.236936

export class ImperialSpeed implements ConversionHandler {
  handler_name = 'imperial'
  base_intermediary_unit = 'm/s'
  sub_units = ['mph']
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
    const as_mps = as_intermediary * MPS_TO_MIH_FACTOR
    return Ok(as_mps)
  }

  into_best_subunit(
    as_intermediary: number,
  ): Result<{ unit: ConversionSymbol; value_as_unit: number | string }> {
    const result = this.into_subunit(as_intermediary, 'mph')
    if (result instanceof Promise || !result.ok)
      return {
        ok: false,
        data: { message: 'this will literally never happen' },
      }

    return Ok({
      unit: {
        conversion_unit_name: 'mi/h',
      },
      value_as_unit: result.data,
    })
  }

  into_intermediary(as_mph: number): Result<number> | Promise<Result<number>> {
    return Ok(as_mph / MPS_TO_MIH_FACTOR)
  }

  convert(data: string): ConversionResult[] | Promise<ConversionResult[]> {
    let return_value: ConversionResult[] = []

    if (!this.default_opposite_unit?.into_best_subunit) return []

    for (const match of data.matchAll(MI_PER_HOUR_REGEX)) {
      const value = Number.parseFloat(match.groups?.['value'] || '')

      const as_mps = Yolo(this.into_intermediary(value))
      const as_metric = this.default_opposite_unit.into_best_subunit(as_mps)

      if (as_metric.ok) {
        return_value.push({
          from_unit: {
            conversion_unit_name: 'mi/h',
          },
          to_unit: as_metric.data.unit,
          initial_value: value,
          converted_value: as_metric.data.value_as_unit,
        })
      }
    }

    return return_value
  }
}

const POUND_REGEX = /(?<value>[0-9,.]+)( |)(lbs|lb) /gm

const LBS_TO_GRAM = 453.5924

export class ImperialMass implements ConversionHandler {
  handler_name = 'Imperial weight'
  base_intermediary_unit = 'gram'
  sub_units = ['pound']
  default_opposite_unit?: ConversionHandler | undefined

  constructor(opposite?: ConversionHandler) {
    this.default_opposite_unit = opposite
  }

  into_subunit(
    as_intermediary: number,
    subunit: string,
  ): Result<number> | Promise<Result<number>> {
    return Ok(as_intermediary / LBS_TO_GRAM)
  }

  into_best_subunit(
    as_intermediary: number,
  ): Result<{ unit: ConversionSymbol; value_as_unit: number | string }> {
    const as_lbs = as_intermediary / LBS_TO_GRAM

    return Ok({
      unit: {
        conversion_unit_name: 'pound',
        conversion_symbol: 'lbs',
      },
      value_as_unit: as_lbs,
    })
  }

  into_intermediary(
    as_unit: number,
    subunit?: string,
  ): Result<number> | Promise<Result<number>> {
    return Ok(as_unit * LBS_TO_GRAM)
  }

  convert(
    data: string,
    into_unit?: string,
  ): ConversionResult[] | Promise<ConversionResult[]> {
    let conversion_results: ConversionResult[] = []

    if (!this.default_opposite_unit?.into_best_subunit) return []

    for (const match of data.matchAll(POUND_REGEX)) {
      const value = Number.parseFloat(match.groups?.['value'] || '')
      const as_metric = this.default_opposite_unit.into_best_subunit(
        Yolo(this.into_intermediary(value, 'pounds')),
      )

      if (as_metric.ok) {
        conversion_results.push({
          from_unit: {
            conversion_unit_name: 'pound',
            conversion_symbol: 'lbs',
          },
          to_unit: as_metric.data.unit,
          converted_value: as_metric.data.value_as_unit,
          initial_value: value,
        })
      }
    }

    return conversion_results
  }
}
