import { URL_STRING } from './common'

interface EmbedFooter {
  text: string
  icon_url?: URL
}

interface EmbedAuthor {
  name: string
  url?: URL
  icon_url?: URL
}

interface EmbedField {
  name: string
  value: string
  inline?: boolean
}

const DEFAULT_COLOURS = {
  aqua: 0x00ffff,
  red: 0xff0000,
  green: 0x008000,
  pink: 0xff69b4,
  bot_branding: 0x40f4ac,
}

type default_clrs = keyof typeof DEFAULT_COLOURS

export class Embed {
  type = 'rich'
  title?: string
  description?: string
  url?: string
  timestamp?: string
  color?: number
  footer?: EmbedFooter
  author?: EmbedAuthor
  fields?: EmbedField[] = []

  constructor() {}

  addField(name: string, value: string, inline?: boolean) {
    this.fields?.push({ name, value, inline })
  }

  setFooter(text: string, icon?: URL) {
    this.footer = { text, icon_url: icon }
  }

  setAuthor(name: string, url?: URL, icon_url?: URL) {
    this.author = { name, url, icon_url }
  }

  setTitle(text: string) {
    this.title = text
  }

  setColour(colour: default_clrs | `#${string}`) {
    const defaults = DEFAULT_COLOURS as { [id: string]: number }
    if (defaults[colour]) this.color = defaults[colour]
    else if (colour.toString().startsWith('#')) {
      const as_hex = colour.toString().replace('#', '0x')
      this.color = Number.parseInt(as_hex)
    } else {
      console.warn(`[EMBED] cannot parse "${colour}" as a colour`)
    }
  }

  setDescription(description: string) {
    this.description = description
  }

  setUrl(url: URL_STRING) {
    this.url = url
  }

  into_object(): Object {
    return {
      type: this.type,
      title: this.title,
      description: this.description,
      url: this.url,
      timestamp: this.timestamp,
      color: this.color,
      footer: this.footer,
      author: this.author,
      fields: this.fields,
    }
  }
}
