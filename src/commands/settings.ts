import { fetch_currency_list } from '../convertions/currency'
import { set_user_preffered_currency } from '../database'
import { Embed } from '../discord/embed'
import {
  AutocompleteInteraction,
  SlashInteraction,
} from '../discord/interaction'
import { DiscordChoice } from '../interfaces/discord'

export async function handle_settings_command(interaction: SlashInteraction) {
  interaction.set_ephermal(true)
  const option = interaction.get_option('currency')

  if (!option || typeof option.value != 'string') {
    interaction.reply_error('option did not exist or was not string')
    return
  }

  if (!interaction.user_id) {
    interaction.reply_error('somehow... you dont exist?')
    return
  }

  set_user_preffered_currency(interaction.user_id, option.value)

  const embed = new Embed()
  embed.setColour('green')
  embed.setTitle('Configuration')
  embed.setDescription(`You selected \`${option.value}\` to be your currency!`)

  interaction.respond({ embeds: [embed] })
}

export async function handle_settings_autocomplete(
  interaction: AutocompleteInteraction,
) {
  const option = interaction.options.find(opt => opt.name === 'currency')
  let choices: DiscordChoice[] = []
  const res = await fetch_currency_list()

  if (res.ok) {
    choices = Object.keys(res.data.eur)
      .filter(name => name.includes(option?.value.toString() || ''))
      .map(value => {
        return { name: value, value }
      })
  }

  interaction.respond({
    choices: choices.slice(0, Math.min(choices.length, 25)),
  })
}
