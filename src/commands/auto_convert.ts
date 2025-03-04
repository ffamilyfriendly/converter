import { convert_from_text } from '../convertions'
import { get_user_data } from '../database'
import { Embed } from '../discord/embed'
import { MessageInteraction } from '../discord/interaction'
import {
  check_paywall,
  create_paywall_embed,
  create_paywall_notice,
} from '../utils/paywall'

export async function run(interaction: MessageInteraction) {
  interaction.set_ephermal(true)

  const paywall_check = check_paywall(interaction.user_id, interaction)

  if (!paywall_check.paywall_ok) {
    create_paywall_notice(interaction)
    return
  }

  const embed = create_paywall_embed(paywall_check)
  embed.setColour('bot_branding')
  let into_currency

  if (interaction.user_id) {
    const user_config = get_user_data(interaction.user_id)

    if (!user_config?.currency) {
      embed.setDescription(
        `Please set your desired currency with \`/currency\` for currency conversions!`,
      )
    } else {
      into_currency = user_config.currency
    }
  } else {
    console.warn('author not exist???')
  }

  const convertion_results = await convert_from_text(
    interaction.target_message.content,
    into_currency,
  )

  let converted = ''

  for (const result of convertion_results) {
    const display_converted_value =
      typeof result.converted_value === 'number'
        ? result.converted_value.toFixed(2)
        : result.converted_value
    converted += `- ${result.initial_value} *${result.from_unit.conversion_unit_name_plural || result.from_unit.conversion_unit_name}* converts into ${display_converted_value} *${result.to_unit.conversion_unit_name_plural || result.to_unit.conversion_unit_name}*\n`
  }

  if (convertion_results.length === 0)
    embed.addField(
      'No Units Found',
      'did we miss a unit? Please join the support server and let us know!',
    )
  else embed.addField('Found Units', converted)

  interaction.respond({ embeds: [embed] })
}
