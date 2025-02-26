import { conversion_handlers } from '../convertions'
import { AutocompleteInteraction } from '../discord/interaction'

export async function handle_command() {}

export async function handle_autocomplete(
  interaction: AutocompleteInteraction,
) {
  let choices = []

  for (const handler of conversion_handlers) {
    choices.push({
      name: `${handler.handler_name} (${handler.sub_units.length} subunits)`,
      value: handler.handler_name,
    })
  }

  interaction.respond({ choices })
}
