import {
  BaseDiscordInteraction,
  DiscordEntitlement,
  DiscordGuildMember,
  DiscordMessage,
  DiscordUser,
  MessageContextInteraction,
  AutocompleteInteraction as I_AutocompleteInteraction,
  DiscordChoice,
  I_AutocompleteOption,
  SlashCommandInteraction,
  I_Option,
} from '../interfaces/discord'
import { Response } from 'express'
import { DiscordWebhookClient } from './client'
import { Embed } from './embed'
import { ActionRow } from './components'
import { Option } from '../interfaces/commands'

const DISCORD_CALLBACK_TYPES = {
  // Respond to an interaction with a message
  CHANNEL_MESSAGE_WITH_SOURCE: 4,
  // ACK an interaction and edit a response later, the user sees a loading state
  DEFERRED_MESSAGE_WITH_SOURCE: 5,
  // For components, ACK an interaction and edit the original message later; the user does not see a loading state
  DEFERRED_UPDATE_MESSAGE: 6,
  // 	For components, edit the message the component was attached to
  UPDATE_MESSAGE: 7,
  // Respond to an autocomplete interaction with suggested choices
  APPLICATION_COMMAND_AUTOCOMPLETE_RESULT: 8,
  // 	Respond to an interaction with a popup modal
  MODAL: 9,
}

const DISCORD_MESSAGE_FLAGS = {
  CROSSPOSTED: 1 << 0,
  IS_CROSSPOST: 1 << 1,
  SUPPRESS_EMBEDS: 1 << 2,
  SOURCE_MESSAGE_DELETED: 1 << 3,
  URGENT: 1 << 4,
  HAS_THREAD: 1 << 5,
  EPHEMERAL: 1 << 6,
  LOADING: 1 << 7,
  FAILED_TO_MENTION_SOME_ROLES_IN_THREAD: 1 << 8,
  SUPPRESS_NOTIFICATIONS: 1 << 12,
  IS_VOICE_MESSAGE: 1 << 13,
  HAS_SNAPSHOT: 1 << 14,
}

interface ContextObject {
  client: DiscordWebhookClient
  response: Response
}

interface ResponseOptions {
  embeds?: Embed[]
  components?: ActionRow[]
  choices?: DiscordChoice[]
}

interface SendHandleOptions extends ResponseOptions {
  content?: string
}

/*
export interface BaseDiscordInteraction<T = unknown>
  extends BaseDiscordRequest {
  // The ID of this interaction
  id: string
  application_id: string
  type: number // https://discord.com/developers/docs/interactions/receiving-and-responding#interaction-object-interaction-type
  app_permissions: string
  entitlements: DiscordEntitlement[]
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

  data: {
    id: string
    name: string
    type: number
    resolved: T
  }
}

*/

export class Guild {
  constructor(NOT_IMPLEMENTED: any) {}
}

export class BaseInteraction {
  client: DiscordWebhookClient
  protected http_handle: Response
  private response_flags = 0

  // cool stuff
  readonly id: string
  readonly application_id: string
  readonly interaction_type: number
  readonly entitlements: DiscordEntitlement[]
  readonly locale: string
  readonly interaction_token: string
  readonly guild?: Guild
  readonly guild_id?: string
  readonly author?: DiscordUser
  readonly member?: DiscordGuildMember
  readonly message?: DiscordMessage
  readonly command_name: string
  readonly command_id: string
  readonly sku_ids: string[]
  readonly integration_owners: { [id: string]: string }
  user_id: string
  has_been_responded = false

  constructor(data: BaseDiscordInteraction, ctx: ContextObject) {
    console.log(data)
    this.client = ctx.client
    this.http_handle = ctx.response
    this.id = data.id
    this.application_id = data.application_id
    this.interaction_type = data.type
    this.entitlements = data.entitlements
    this.locale = data.locale
    this.interaction_token = data.token
    this.guild = data.guild ? new Guild(data.guild) : undefined
    this.guild_id = data.guild_id
    this.author = data.user
    this.member = data.member
    this.message = data.message
    this.command_name = data.data.name
    this.command_id = data.data.id
    this.sku_ids = data.entitlement_sku_ids
    this.integration_owners = data.authorizing_integration_owners

    this.user_id =
      data.member?.user?.id || data.user?.id || '<SOMETHING WENT MAJORLY WRONG>'
  }

  private check_flag(flag: number) {
    return (this.response_flags & flag) != 0
  }

  private add_flag(flag: number) {
    this.response_flags |= flag
  }

  private remove_flag(flag: number) {
    this.response_flags &= ~flag
  }

  get ephermal(): boolean {
    return this.check_flag(DISCORD_MESSAGE_FLAGS.EPHEMERAL)
  }

  set_ephermal(state: boolean) {
    if (state) this.add_flag(DISCORD_MESSAGE_FLAGS.EPHEMERAL)
    else this.remove_flag(DISCORD_MESSAGE_FLAGS.EPHEMERAL)
  }

  protected send_handle_response(type: number, data: SendHandleOptions) {
    if (this.has_been_responded) {
      console.warn('Attempt to respond to already handled interaction')
      console.trace('stack')
      return
    }

    const data_object = {
      content: data.content,
      embeds: data.embeds?.map(embed => embed.into_object()),
      components: data.components?.map(component => component.into_object()),
      choices: data.choices,
    }

    const response_object = {
      type,
      data: { flags: this.response_flags, ...data_object },
    }

    this.has_been_responded = true
    this.http_handle.send(response_object)
    this.http_handle.destroy()
  }

  reply_error(message: string, title?: string) {
    const embed = new Embed()
    embed.setColour('red')
    embed.setDescription(message)
    embed.setTitle(title || 'Something went wrong')

    this.respond({ embeds: [embed] })
  }

  respond(message: string): void
  respond(message: string, options: ResponseOptions): void
  respond(options: ResponseOptions): void
  respond(arg1: string | ResponseOptions, arg2?: ResponseOptions) {
    let text_content
    let rest

    if (typeof arg1 === 'string') {
      text_content = arg1
      if (arg2) rest = arg2
    } else rest = arg1

    this.send_handle_response(
      DISCORD_CALLBACK_TYPES.CHANNEL_MESSAGE_WITH_SOURCE,
      { content: text_content, ...rest },
    )
  }
}

export class MessageInteraction extends BaseInteraction {
  readonly target_message: DiscordMessage

  constructor(data: MessageContextInteraction, ctx: ContextObject) {
    super(data, ctx)

    this.target_message =
      data.data.resolved.messages[Object.keys(data.data.resolved.messages)[0]]
  }
}

export class AutocompleteInteraction extends BaseInteraction {
  options: I_AutocompleteOption[]

  constructor(data: I_AutocompleteInteraction, ctx: ContextObject) {
    super(data, ctx)
    this.options = data.data.options
  }

  override respond(message: string): void
  override respond(message: string, options: ResponseOptions): void
  override respond(options: ResponseOptions): void
  override respond(
    arg1: string | ResponseOptions,
    arg2?: ResponseOptions,
  ): void {
    let choices: DiscordChoice[] = []
    if (typeof arg1 === 'string' || !arg1.choices) {
      console.warn(
        'tried to respond to AUTOCOMPLETE interaction without providing choices',
      )
    } else choices = arg1.choices

    this.send_handle_response(
      DISCORD_CALLBACK_TYPES.APPLICATION_COMMAND_AUTOCOMPLETE_RESULT,
      { choices },
    )
  }
}

export class SlashInteraction extends BaseInteraction {
  options: I_Option[]

  constructor(data: SlashCommandInteraction, ctx: ContextObject) {
    super(data, ctx)

    this.options = data.data.options
  }

  get_option(name: string, assert_type?: 'string' | 'number') {
    return this.options.find(
      option =>
        option.name === name &&
        (assert_type ? typeof option.value == assert_type : true),
    )
  }
}
