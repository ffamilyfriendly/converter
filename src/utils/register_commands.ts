import { DiscordWebhookClient } from '../discord/client'
import {
  ApplicationCommand,
  DISCORD_COMMAND_TYPES,
  DISCORD_OPTION_TYPES,
} from '../interfaces/commands'

const AUTO_CONVERT_COMMAND: ApplicationCommand = {
  type: DISCORD_COMMAND_TYPES.MESSAGE,
  name: 'Auto Convert',
  description: '',
}

const SETTINGS_COMMAND: ApplicationCommand = {
  type: DISCORD_COMMAND_TYPES.CHAT_INPUT,
  name: 'settings',
  description: 'tweak converter to your liking!',
  options: [
    {
      type: DISCORD_OPTION_TYPES.SUB_COMMAND_GROUP,
      name: 'set',
      description: 'sets the value of a config option',
      options: [
        {
          type: DISCORD_OPTION_TYPES.SUB_COMMAND,
          name: 'currency',
          description: 'select what currency you want conversions in',
          options: [
            {
              type: DISCORD_OPTION_TYPES.STRING,
              name: 'currency',
              description: 'the currency you want',
              required: true,
              autocomplete: true,
            },
          ],
        },
      ],
    },
    {
      type: DISCORD_OPTION_TYPES.SUB_COMMAND_GROUP,
      name: 'get',
      description: 'shows the current value of a config option',
      options: [
        {
          type: DISCORD_OPTION_TYPES.SUB_COMMAND,
          name: 'currency',
          description: 'displays what currency you set',
        },
      ],
    },
  ],
}

const CONVERT_COMMAND: ApplicationCommand = {
  type: DISCORD_COMMAND_TYPES.CHAT_INPUT,
  name: 'convert',
  description: 'freely convert values between our plethora of units',
  options: [
    {
      type: DISCORD_OPTION_TYPES.STRING,
      name: 'from',
      description: 'convert from this unit',
      autocomplete: true,
      required: true,
    },
    {
      type: DISCORD_OPTION_TYPES.NUMBER,
      name: 'value',
      description: 'the value in your selected unit to convert',
      required: true,
    },
    {
      type: DISCORD_OPTION_TYPES.STRING,
      name: 'to',
      description: 'the unit to convert to',
      autocomplete: true,
      required: true,
    },
  ],
}

export default async function reg_commands(
  client: DiscordWebhookClient,
  globally = true,
) {
  console.log('registering commands...')
  const result = await client.register_commands(
    [AUTO_CONVERT_COMMAND, SETTINGS_COMMAND, CONVERT_COMMAND],
    !globally,
  )

  if (result.ok) {
    console.log('✅ Commands registered!')
  } else {
    console.error(`🔥 could not register commands`, result.data.message)
  }
}
