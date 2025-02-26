import { ConversionHandler, ConversionResult } from '../interfaces/convertions'
import Currency from './currency'
import { ImperialLength, ImperialMass, ImperialSpeed } from './imperial'
import { MetricLength, MetricMass, MetricSpeed } from './metric'
import { Celcius, Fahrenheit } from './temperature'
import { AmericanTime, NormalTime } from './time'

export const conversion_handlers: Set<ConversionHandler> = new Set([
  // Metric units
  new MetricLength(new ImperialLength()),
  new MetricSpeed(new ImperialSpeed()),
  new MetricMass(new ImperialMass()),

  // American units
  new ImperialLength(new MetricLength()),
  new ImperialSpeed(new MetricSpeed()),
  new ImperialMass(new MetricMass()),

  // Assorted units
  new Celcius(new Fahrenheit()),
  new Fahrenheit(new Celcius()),
  new Currency(),

  // Time
  new NormalTime(new AmericanTime()),
  new AmericanTime(new NormalTime()),
])

export function add_conversion_handler(new_handler: ConversionHandler) {
  conversion_handlers.add(new_handler)
}

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

  for (const handler of conversion_handlers) {
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
