import { assert } from 'console'
import { conversion_instance, convert_from_text } from './convertions'

const test_strings = [
  {
    text: 'i ran 5 inches today ',
    expect: [['1.27', 'decimeter']],
  },
  {
    text: 'my phone is 19 cm tall and 1dm wide',
    expect: [
      ['7.48', 'inch'],
      ['3.94', 'inch'],
    ],
  },
]

export async function run_tests() {
  for (const test of test_strings) {
    console.log(`\nrunning ${test.text} with ${test.expect.length} assertions`)
    const conversions = await convert_from_text(test.text, 'sek')
    for (let i = 0; i < conversions.length; i++) {
      const result = conversions[i]
      const expect = test.expect[i]

      const result_sanitized =
        typeof result.converted_value === 'number'
          ? result.converted_value.toFixed(2)
          : result.converted_value

      const is_ok_value = result_sanitized == expect[0]
      const is_ok_unit = result.to_unit.conversion_unit_name == expect[1]
      const is_ok = is_ok_unit && is_ok_value
      const message = `got ${result_sanitized} (${result.to_unit.conversion_unit_name}) expected ${expect[0]} (${expect[1]})`

      if (is_ok) console.log(`✅    OK: ${message}`)
      assert(is_ok, message)
    }
  }
}
