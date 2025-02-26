import { URL_STRING } from './common'

interface Component {
  type: number
  into_object(): Object
}

const BUTTON_STYLES = {
  PRIMARY: 1,
  SECONDARY: 2,
  SUCCESS: 3,
  DANGER: 4,
  LINK: 5,
  PREMIUM: 6,
}

export class Button implements Component {
  readonly type = 2
  style = 1
  label?: string
  emoji?: string
  sku_id?: string
  url?: string
  disabled?: boolean
  custom_id?: string

  setStyle(style: keyof typeof BUTTON_STYLES) {
    this.style = BUTTON_STYLES[style]
  }

  setSku(sku_id: string) {
    this.setStyle('PREMIUM')
    this.sku_id = sku_id
  }

  setUrl(label: string, url: URL_STRING) {
    this.setStyle('LINK')
    this.label = label
    this.url = url
  }

  setLabel(label: string) {
    this.label = label
  }

  setCustomId(custom_id: string) {
    this.custom_id = custom_id
  }

  into_object(): Object {
    return {
      type: this.type,
      style: this.style,
      label: this.label,
      emoji: this.emoji,
      sku_id: this.sku_id,
      url: this.url,
      disabled: this.disabled,
      custom_id: this.custom_id,
    }
  }
}

export class ActionRow {
  readonly type = 1
  components: Component[] = []

  addComponent(component: Component) {
    this.components.push(component)
  }

  into_object(): Object {
    return {
      type: this.type,
      components: this.components.map(component => component.into_object()),
    }
  }
}
