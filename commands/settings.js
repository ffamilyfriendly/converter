const { Interaction, Embed, Option } = require("../lib/interactions")
const { def, isValidSetting, getUserSettings, setUserSettings } = require("../utils/settings")
const command = new Interaction("CHAT_INPUT","setting","change your preferences for converter")

const getSetting = new Option("SUB_COMMAND","get","displays value for settings")
const setSetting = new Option("SUB_COMMAND","set","change value for settings")

const settings = Object.keys(def)
const opt = new Option("STRING", "setting", "the setting", true)
const val = new Option("STRING", "value", "what to change setting to", true)
settings.forEach(c => {
    opt.addChoice(c)
})
getSetting.addOption(opt)
setSetting.addOption(opt)
setSetting.addOption(val)

command.addOption(getSetting)
command.addOption(setSetting)

command.onUsed((res) => {
    const embed = new Embed()

    const key = res.options[0].options[0].value
    if(res.options[0].name == "set") {
        let value = res.options[0].options[1].value
        if(typeof value == "string") value = value.toLowerCase()

        const valid = isValidSetting(key,value)
        embed.color = valid ? 0x32ad32 : 0xff0000
        if(valid) {
            setUserSettings(res.user.id, key, value)
            embed.addField("👌 sure thing, boss!", `**${key}** is now **${value}**`)
        } else {
            embed.addField("❌ No can do", `**${value}** is not an allowed value. Use \`/setting get setting:${key}\` to view allowed values`)
        }
    } else {
        embed.addField("Currently",`**${getUserSettings(res.user.id, key)}**`)
        embed.addField(`Allowed values`, def[key].allowed.join(", "))
    }
    
    res.addEmbed(embed)
    res.private = true
    res.respond()
})

module.exports = command