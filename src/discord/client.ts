import create_express_web_server, { Express, Request, Response } from 'express'
import { json as body_parser_json } from 'body-parser'
import nacl, { verify } from 'tweetnacl'
import { Ok, Err, Result } from '../interfaces/result'
import {
  BaseDiscordInteraction,
  BaseDiscordRequest,
  MessageContextInteraction,
  AutocompleteInteraction as I_AutocompleteInteraction,
} from '../interfaces/discord'
import { IncomingMessage, ServerResponse } from 'http'
import {
  AutocompleteInteraction,
  BaseInteraction,
  MessageInteraction,
} from './interaction'
import { EventEmitter } from 'stream'
import { ApplicationCommand } from '../interfaces/commands'

export const DISCORD_API_BASE = 'https://discord.com/api/v10'

const DISCORD_EVENT = {
  PING: 1,
  EVENT: 2,
  AUTOCOMPLETE: 4,
}

const DISCORD_COMMAND_TYPES = {
  CHAT_INPUT: 1,
  USER: 2,
  MESSAGE: 3,
  PRIMARY_ENTRY_POINT: 4,
}

interface DiscordWebhookClientOptions {
  public_key: string
  discord_token: string
  application_id: string
}

export declare interface DiscordWebhookClient {
  on(
    event: 'interaction',
    listener: (interaction: BaseInteraction) => void,
  ): this
  on(
    event: 'autocomplete',
    listener: (interaction: AutocompleteInteraction) => void,
  ): this
}

export class DiscordWebhookClient extends EventEmitter {
  server: Express
  readonly public_key: string
  readonly application_id: string
  private discord_token: string

  constructor(options: DiscordWebhookClientOptions) {
    super()
    this.public_key = options.public_key
    this.discord_token = options.discord_token
    this.application_id = options.application_id
    this.server = create_express_web_server()

    function save_raw_body(
      req: IncomingMessage,
      res: ServerResponse,
      buf: any,
      encoding: any,
    ) {
      if (buf && buf.length) {
        ;(req as any).raw_body = buf.toString(encoding || 'utf8')
      }
    }

    this.server.use(body_parser_json({ verify: save_raw_body }))

    this.handle_request = this.handle_request.bind(this)
    this.server.post('/webhook', this.handle_request)
  }

  private handle_request(request: Request, response: Response) {
    const request_signature = request.get('X-Signature-Ed25519')
    const request_signature_timestamp = request.get('X-Signature-Timestamp')
    const raw_request_body = (request as any).raw_body as string

    response.setHeader(
      'User-Agent',
      `Converter (github.com/ffamilyfriendly/converter, 1.0.0)`,
    )

    if (!request_signature || !request_signature_timestamp) {
      response.sendStatus(401)
      return
    }

    const PUBLIC_KEY = this.public_key

    const request_has_valid_signature = nacl.sign.detached.verify(
      Buffer.from(request_signature_timestamp + raw_request_body),
      Buffer.from(request_signature, 'hex'),
      Buffer.from(PUBLIC_KEY, 'hex'),
    )

    if (!request_has_valid_signature) {
      response.sendStatus(401)
      return
    }

    // We can safely cast the type without any checks as requests past the previous signature check are confirmed to come from discord.
    // Might cause an issue if they dramatically alter their API in the future but that strikes me as a "future John" problem
    const body = request.body as BaseDiscordRequest

    const ctx = { client: this, response }

    switch (body.type) {
      case DISCORD_EVENT.PING:
        response.status(200).json({ type: 1 })
      case DISCORD_EVENT.EVENT:
        console.log(body)

        const interaction = body as BaseDiscordInteraction

        let interaction_instance: BaseInteraction
        console.log(interaction)
        switch (interaction.data.type) {
          case DISCORD_COMMAND_TYPES.MESSAGE:
            console.log('MESSAGE INTERACTION')
            interaction_instance = new MessageInteraction(
              interaction as MessageContextInteraction,
              ctx,
            )
            break
          default:
            interaction_instance = new BaseInteraction(interaction, ctx)
        }
        // Handle routing of event
        this.emit('interaction', interaction_instance)

      case DISCORD_EVENT.AUTOCOMPLETE: {
        const interaction = body as I_AutocompleteInteraction
        const interaction_instance = new AutocompleteInteraction(
          interaction,
          ctx,
        )

        this.emit('autocomplete', interaction_instance)
      }
    }
  }

  register_commands(
    commands: ApplicationCommand[],
    local = false,
  ): Promise<Result<null>> {
    const URL =
      DISCORD_API_BASE +
      (local
        ? `/applications/${this.application_id}/guilds/874566459429355581/commands`
        : `/applications/${this.application_id}/commands`)

    return new Promise(resolve => {
      fetch(URL, {
        method: 'PUT',
        body: JSON.stringify(commands),
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bot ${this.discord_token}`,
        },
      })
        .then(res => {
          resolve(Ok(null))
        })
        .catch(e => resolve(Err(e)))
    })
  }

  listen(port: number): Result<null> {
    this.server.listen(port, err => {
      if (err) {
        return Err(err.message)
      }
    })
    return Ok(null)
  }
}
