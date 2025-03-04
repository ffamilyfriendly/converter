import {
  get_user_data,
  remove_user_quota_point,
  set_user_quota,
  UserData,
} from '../database'
import { ActionRow, Button } from '../discord/components'
import { Embed } from '../discord/embed'
import { BaseInteraction } from '../discord/interaction'

function is_today(day1: Date, day2: Date) {
  const day_same = day1.getDay() === day2.getDay()
  const month_same = day1.getMonth() === day2.getMonth()
  const year_same = day1.getFullYear() === day2.getFullYear()
  return day_same && month_same && year_same
}

interface I_CheckPaywall {
  paywall_ok: boolean
  uses_left?: number
  state: 'free' | 'premium' | 'server' | 'error'
}

export function check_paywall(
  user_id: string,
  interaction: BaseInteraction,
): I_CheckPaywall {
  if (!process.env.PAYWALL_ENABLED || process.env.PAYWALL_ENABLED == 'false')
    return { paywall_ok: true, state: 'error' }
  if (
    process.env.PAYWALL_FREE_USERS &&
    process.env.PAYWALL_FREE_USERS.split(',').includes(user_id)
  ) {
    return {
      paywall_ok: true,
      state: 'premium',
    }
  }

  if (
    process.env.PAYWALL_USER_SKU &&
    interaction.sku_ids.includes(process.env.PAYWALL_USER_SKU)
  ) {
    return { paywall_ok: true, state: 'premium' }
  }

  // an integration_owner[0] means bot is installed on this guild.
  // a guild install has no limits
  if (interaction.integration_owners['0']) {
    return { paywall_ok: true, state: 'server' }
  }

  const user_quota = process.env.PAYWALL_USER_QUOTA
    ? Number.parseInt(process.env.PAYWALL_USER_QUOTA)
    : 5

  if (!process.env.PAYWALL_USER_QUOTA) {
    console.warn(`PAYWALL_USER_QUOTA not set. Defaulting to 5`)
  }

  let user_data: Omit<UserData, 'id' | 'currency'> | null =
    get_user_data(user_id)
  const current_date = new Date()

  if (!user_data || !is_today(current_date, new Date(user_data.quota_date))) {
    set_user_quota(user_id, user_quota)
    user_data = { quota: user_quota, quota_date: current_date.toDateString() }
  }

  if (user_data.quota <= 0) {
    return {
      paywall_ok: false,
      uses_left: 0,
      state: 'free',
    }
  }

  remove_user_quota_point(user_id)
  return {
    paywall_ok: true,
    uses_left: user_data.quota - 1,
    state: 'free',
  }
}

export function create_paywall_embed(payment_data: I_CheckPaywall): Embed {
  const embed = new Embed()

  let footer_text = 'something went wrong'
  switch (payment_data.state) {
    case 'premium':
      footer_text = 'thank you for supporting the bot 💖'
      break
    case 'free':
      footer_text = `You have ${payment_data.uses_left}/${process.env.PAYWALL_USER_QUOTA || '5'} free uses left today`
      break
    case 'server':
      footer_text = `Want to use converter anywhere? Add it as an app!`
      break
  }

  embed.setFooter(footer_text)

  return embed
}

export function create_paywall_notice(interaction: BaseInteraction) {
  if (!process.env.PAYWALL_USER_SKU) {
    interaction.reply_error(
      'The bot owner has enabled paywalling but forgot to provide the user SKU. Let them know',
    )
    return
  }

  const tomorrow = new Date()
  tomorrow.setDate(tomorrow.getDate() + 1)
  tomorrow.setHours(0, 0, 0)

  const tomorrow_timestamp = `<t:${Math.floor(tomorrow.getTime() / 1000)}:R>`

  const embed = new Embed()
  embed.setTitle('Unlock Unlimited Conversions!')
  embed.setDescription(
    `Keep using conversions anywhere by upgrading to unlimited usage!\n\nAs a free user, you recieve ${process.env.PAYWALL_USER_QUOTA || '5'} new conversions per day. You will get more conversions ${tomorrow_timestamp}`,
  )
  embed.setColour('bot_premium')

  const row = new ActionRow()
  const premium_btn = new Button()
  premium_btn.setSku(process.env.PAYWALL_USER_SKU)
  row.addComponent(premium_btn)

  interaction.respond({ embeds: [embed], components: [row] })
}
