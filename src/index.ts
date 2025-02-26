import dotenv from 'dotenv'
import { DiscordWebhookClient } from './discord/client'
import { run as auto_run_command } from './commands/auto_convert'
import { MessageInteraction } from './discord/interaction'
import reg_commands from './utils/register_commands'
import { argv } from 'process'
import { handle_autocomplete } from './commands/manual_convert'

dotenv.config()

const REQUIRED_ENV_VALUES = [
  'DISCORD_PUBLIC_KEY',
  'DISCORD_TOKEN',
  'DISCORD_APPLICATION_ID',
]

let faulty_configuration = false
for (const env_value of REQUIRED_ENV_VALUES) {
  if (!process.env[env_value]) {
    console.warn(`⚠️ ${env_value} - not set`)
    faulty_configuration = true
  }
}

if (faulty_configuration) {
  console.error(
    'Configuration values missing. Please make sure the values listed above are properly set',
  )
  process.exit(1)
} else {
  console.log(`✅ Configuration in order`)
}

const client = new DiscordWebhookClient({
  public_key: process.env.DISCORD_PUBLIC_KEY || '',
  discord_token: process.env.DISCORD_TOKEN || '',
  application_id: process.env.DISCORD_APPLICATION_ID || '',
})

argv.forEach(value => {
  const [key, val] = value.split('=')

  if (key === 'register') {
    const global = val === 'global'
    console.log(
      `Registering commands ${global ? 'globally' : 'on your dev server'}`,
    )
    reg_commands(client, global)
  }
})

client.on('interaction', interaction => {
  switch (interaction.command_name) {
    case 'Auto Convert':
      if (interaction instanceof MessageInteraction)
        auto_run_command(interaction)
      break
  }
})

client.on('autocomplete', interaction => {
  switch (interaction.command_name) {
    case 'convert':
      handle_autocomplete(interaction)
  }
})

const server_listening_port = Number(process.env.SERVICE_HTTP_PORT || 3000)
client.listen(server_listening_port)
