import { convert_from_text } from '../convertions'
import { get_user_preffered_currency } from '../database'
import { Embed } from '../discord/embed'
import { MessageInteraction } from '../discord/interaction'

export async function run(interaction: MessageInteraction) {
  interaction.set_ephermal(true)
  const embed = new Embed()
  embed.setColour('bot_branding')
  let into_currency

  if (interaction.user_id) {
    const user_config = get_user_preffered_currency(interaction.user_id)

    if (!user_config) {
      embed.setFooter('Please run /currency to select a currency to use')
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
    converted += `- ${result.initial_value} ${result.from_unit.conversion_unit_name_plural || result.from_unit.conversion_unit_name} -> ${result.converted_value} ${result.to_unit.conversion_unit_name_plural || result.to_unit.conversion_unit_name}\n`
  }
  embed.addField('yay', converted)

  interaction.respond({ embeds: [embed] })
}
