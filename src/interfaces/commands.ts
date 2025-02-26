export const DISCORD_OPTION_TYPES = {
  SUB_COMMAND: 1,
  SUB_COMMAND_GROUP: 2,
  STRING: 3,
  INTEGER: 4,
  BOOLEAN: 5,
  USER: 6,
  CHANNEL: 7,
  ROLE: 8,
  MENTIONABLE: 9,
  NUMBER: 10,
  ATTACHMENT: 11,
}

export interface Option {
  type: number
  name: string
  description: string
  required?: boolean
  choices?: { name: string; value: string | number }[]
  autocomplete?: boolean
  options?: Option[]
}

export const DISCORD_COMMAND_TYPES = {
  CHAT_INPUT: 1,
  USER: 2,
  MESSAGE: 3,
  PRIMARY_ENTRY_POINT: 4,
}

export interface ApplicationCommand {
  name: string
  type: number
  description: string
  integration_types?: number[]
  options?: Option[]
}
