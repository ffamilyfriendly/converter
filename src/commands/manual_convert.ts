import { conversion_instance } from '../convertions'
import { Embed } from '../discord/embed'
import {
  AutocompleteInteraction,
  MessageInteraction,
  SlashInteraction,
} from '../discord/interaction'

function split_convert_id(id: string): [string, string] {
  const [handler_name, subunit] = id.split(':')
  return [handler_name, subunit]
}

export async function handle_command(interaction: SlashInteraction) {
  interaction.set_ephermal(true)
  const from = interaction.get_option('from')
  const to = interaction.get_option('to')
  const value = interaction.get_option('value')

  if (!from || !to || !value) {
    interaction.reply_error('required option missing')
    return
  }

  if (
    typeof from.value != 'string' ||
    typeof to.value != 'string' ||
    typeof value.value != 'number'
  ) {
    interaction.reply_error('type mismatch on options')
    return
  }

  const [from_uuid, from_subunit] = split_convert_id(from.value)
  const [to_uuid, to_subunit] = split_convert_id(to.value)

  const from_handler = conversion_instance.get_handler(from_uuid)
  const to_handler = conversion_instance.get_handler(to_uuid)

  if (!from_handler || !to_handler) {
    interaction.reply_error('could not get conversion handler')
    return
  }

  const from_result = await from_handler.into_intermediary(
    value.value,
    from_subunit,
  )

  if (!from_result.ok) {
    interaction.reply_error(
      `could not convert \`${value.value} ${from_subunit}\` base unit into intermediary unit (${from_handler.base_intermediary_unit})`,
    )
    return
  }

  const converted_result = await to_handler.into_subunit(
    from_result.data,
    to_subunit,
  )

  if (!converted_result.ok) {
    interaction.reply_error(`could not convert base unit into ${to_subunit}`)
    return
  }

  const embed = new Embed()
  embed.setColour('bot_branding')
  embed.setTitle('Conversion done')
  embed.setDescription(
    `${value.value} *${from_subunit}* converts into ${converted_result.data} *${to_subunit}*`,
  )

  interaction.respond({ embeds: [embed] })
}

export async function handle_autocomplete(
  interaction: AutocompleteInteraction,
) {
  let choices = []

  const first_option = interaction.options.find(opt => opt.name === 'from')
  const focused_option = interaction.options.find(opt => opt.focused)
  let force_subunit

  if (first_option) {
    const [handler_name, _subunit] = split_convert_id(
      first_option.value.toString(),
    )
    const from_unit = conversion_instance.get_handler(handler_name)

    if (from_unit) {
      force_subunit = from_unit.base_intermediary_unit
    }
  }

  if (!focused_option) {
    console.warn('Somehow there was no focused option')
    return
  }

  const values_matching = conversion_instance.search_by_subunit(
    focused_option.value.toString(),
    force_subunit,
  )

  const MAX_ALLOWED = 25
  let counter = 0

  for (const handler of values_matching) {
    if (counter >= MAX_ALLOWED) break
    choices.push({
      name: handler.matches,
      value: `${handler.handler}:${handler.matches}`,
    })
    counter++
  }

  interaction.respond({ choices })
}
