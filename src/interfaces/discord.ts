export interface BaseDiscordRequest {
  type: number
}

export interface DiscordGuild {
  id: string
  name: string
  icon?: string
  icon_hash?: string

  // true if the caller of the interaction is the owner of the guild
  owner?: boolean
  owner_id: string
}

export interface DiscordChannel {
  id: string
  type: number
  guild_id?: string
  name?: string
  nsfw?: boolean
}

export interface DiscordUser {
  id: string
  username: string
  global_name: string
  bot?: boolean
}

export interface DiscordGuildMember {
  user?: DiscordUser
  nick?: string
  avatar?: string
  roles: string[]
  joined_at: string
}

export interface DiscordMessage {
  id: string
  channel_id: string
  author: DiscordUser
  content: string
  timestamp: string
  edited_timestamp: string
}

export interface DiscordChoice {
  name: string
  value: string
}

export interface DiscordEntitlement {
  id: string
  sku_id: string
  application_id: string
  user_id?: string
  type: number // https://discord.com/developers/docs/resources/entitlement#entitlement-object-entitlement-types
  deleted: boolean
  starts_at: string
  ends_at: string
  guild_id?: string
  consumed?: boolean
}

interface BaseDiscordData {
  id: string
  name: string
  type: number
}

interface Resolveable<T> extends BaseDiscordData {
  resolved: T
}

export interface BaseDiscordInteraction<T = BaseDiscordData>
  extends BaseDiscordRequest {
  // The ID of this interaction
  id: string
  application_id: string
  type: number // https://discord.com/developers/docs/interactions/receiving-and-responding#interaction-object-interaction-type
  app_permissions: string
  entitlements: DiscordEntitlement[]
  entitlement_sku_ids: string[]
  authorizing_integration_owners: { [id: string]: string }
  locale: string
  context?: number

  // Token used for responding to the interaction
  token: string

  // only relevant if interaction ran in guild. Otherwise undefined
  guild?: DiscordGuild
  guild_id?: string
  member?: DiscordGuildMember

  channel?: DiscordChannel
  channel_id?: string

  // Will only exist if called in a DM
  user?: DiscordUser
  message?: DiscordMessage

  data: T
}

export interface MessageContextInteraction
  extends BaseDiscordInteraction<
    Resolveable<{ messages: { [id: string]: DiscordMessage } }>
  > {}

export interface I_Option {
  type: number
  name: string
  value: string | number
}

interface I_SlashcmdOptions extends BaseDiscordData {
  options: I_Option[]
}

export interface SlashCommandInteraction
  extends BaseDiscordInteraction<I_SlashcmdOptions> {}

export interface I_AutocompleteOption extends I_Option {
  focused: boolean
}

interface I_AutoComplete extends BaseDiscordData {
  options: I_AutocompleteOption[]
}

export interface AutocompleteInteraction
  extends BaseDiscordInteraction<I_AutoComplete> {}
