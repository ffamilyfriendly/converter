import { convert_from_text } from '../convertions'
import { Embed } from '../discord/embed'
import { MessageInteraction } from '../discord/interaction'

export async function run(interaction: MessageInteraction) {
  const embed = new Embed()
  const convertion_results = await convert_from_text(
    interaction.target_message.content,
  )

  let converted = ''

  for (const result of convertion_results) {
    converted += `- ${result.initial_value} ${result.from_unit.conversion_unit_name_plural || result.from_unit.conversion_unit_name} -> ${result.converted_value} ${result.to_unit.conversion_unit_name_plural || result.to_unit.conversion_unit_name}\n`
  }
  embed.addField('yay', converted)

  interaction.respond({ embeds: [embed] })
}
