import { ConversionHandler, ConversionResult } from '../interfaces/convertions'
import Currency from './currency'
import { ImperialLength, ImperialMass, ImperialSpeed } from './imperial'
import { MetricLength, MetricMass, MetricSpeed, Misc } from './metric'
import { Celcius, Fahrenheit } from './temperature'
import { AmericanTime, NormalTime } from './time'
import { randomUUID } from 'crypto'

export class ConvertionManager {
  handlers: Map<string, ConversionHandler>

  constructor() {
    this.handlers = new Map()
    this.register_defaults()
  }

  register_handlers(handlers: ConversionHandler[] | ConversionHandler) {
    const as_arr = Array.isArray(handlers) ? handlers : [handlers]

    for (const handler of as_arr) {
      const handler_id = randomUUID()
      this.handlers.set(handler_id, handler)
    }
  }

  private register_defaults() {
    const metric_length = new MetricLength()
    const imperial_length = new ImperialLength()
    metric_length.default_opposite_unit = imperial_length
    imperial_length.default_opposite_unit = metric_length

    const metric_speed = new MetricSpeed()
    const imperial_speed = new ImperialSpeed()
    metric_speed.default_opposite_unit = imperial_speed
    imperial_speed.default_opposite_unit = metric_speed

    const metric_mass = new MetricMass()
    const imperial_mass = new ImperialMass()
    metric_mass.default_opposite_unit = imperial_mass
    imperial_mass.default_opposite_unit = metric_mass

    const temp_celcius = new Celcius()
    const temp_fahrenheit = new Fahrenheit()
    temp_celcius.default_opposite_unit = temp_fahrenheit
    temp_fahrenheit.default_opposite_unit = temp_celcius

    const world_time = new NormalTime()
    const american_time = new AmericanTime()
    world_time.default_opposite_unit = american_time
    american_time.default_opposite_unit = world_time

    const currency = new Currency()
    const misc = new Misc()

    this.register_handlers([
      metric_length,
      imperial_length,
      metric_speed,
      imperial_speed,
      metric_mass,
      imperial_mass,
      temp_celcius,
      temp_fahrenheit,
      world_time,
      american_time,
      currency,
      misc,
    ])
  }

  get_handler(id: string) {
    return this.handlers.get(id)
  }

  get_handlers(): ConversionHandler[] {
    return Array.from(this.handlers.values())
  }

  search_by_subunit(query: string, intermidiary?: string) {
    let return_value: {
      handler: string
      matches: string
    }[] = []

    for (const [handler_id, handler] of this.handlers) {
      const same_base_unit = intermidiary
        ? handler.base_intermediary_unit === intermidiary
        : true

      if (!same_base_unit) continue

      const found_subunit = handler.sub_units.filter(subunit =>
        subunit.includes(query),
      )

      for (const subunit of found_subunit) {
        return_value.push({
          handler: handler_id,
          matches: subunit,
        })
      }
    }

    return return_value
  }
}

export const conversion_instance = new ConvertionManager()

export async function convert_from_text(
  text: string,
  into_unit?: string,
): Promise<ConversionResult[]> {
  text = text.toLowerCase()
  if (process.env.SUBSTITUTE_WRITTEN_NUMBERS) {
    const number_list = [
      / one /,
      / two /,
      / three /,
      / four /,
      / five /,
      / six /,
      / seven /,
      / eight /,
      / nine /,
      / ten /,
    ]

    for (let i = 0; i < number_list.length; i++) {
      text = text.replace(number_list[i], (i + 1).toString())
    }
  }

  // We're adding an extra space after the text as it helps out the regexes used to find units
  text = text + ' '

  const return_values = []

  for (const handler of conversion_instance.get_handlers()) {
    if (handler.convert) {
      const result = await handler.convert(text, into_unit)
      return_values.push(...result)
    } else {
      console.log(
        `hander ${handler.handler_name} does not have a convert function...`,
      )
    }
  }

  return return_values
}
