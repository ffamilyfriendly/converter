const config = require("dotenv").config().parsed,
    { Interaction, InteractionHandler, Embed, Option } = require("./lib/interactions"),
    { doConversions } = require("./lib/measurements")

const handler = new InteractionHandler(config.TOKEN,"592814450084675594")
const command = new Interaction("MESSAGE","Auto Convert")
const help = new Interaction("CHAT_INPUT","info","displays some info about the bot")
const settings = new Interaction("CHAT_INPUT","setting","change your preferences for converter")

const getSetting = new Option("SUB_COMMAND","get","displays value for settings")
const setSetting = new Option("SUB_COMMAND","set","change value for settings")

settings.addOption(getSetting)
settings.addOption(setSetting)

/**
 * 
 * @param {string} data 
 * @returns 
 */
const parseMessage = (data) => {
    const embed = new Embed()
    const concatenated = data.replace("°","").replace(/(?<=\d) /gm,"").toLowerCase() + " "
    const result = doConversions(concatenated)
    for(let i = 0; i < result.length; i++) {
        if(i >= 25) break;
        embed.addField(`conversion #${i+1}`,`${result[i].from} **➟** ${result[i].to}`)
    }
    embed.description = data
    return embed
}

command.onUsed((res) => {
    const embed = parseMessage(res.message.content)
    embed.title = `${res.message.author.username}#${res.message.author.discriminator}`
    embed.setFooter("missing a conversion? edit and make PR on https://github.com/ffamilyfriendly/converter/blob/main/lib/measurements.js")
    res.addEmbed(embed)
    res.private = true
    res.respond()
})

help.onUsed((res) => {
    const e = new Embed()
        e.addField("Converter","version **1.0,0**")
        e.addField("Github","**🐛 report bugs:** [click here!](https://github.com/ffamilyfriendly/converter/issues/new?assignees=&labels=bug&template=bug_report.md&title=Bug)\n✨ **suggest feature:** [click here!](https://github.com/ffamilyfriendly/converter/issues/new?assignees=&labels=enhancement&template=feature_request.md&title=)\n🤓 **github repo:** [ffamilyfriendly/converter](https://github.com/ffamilyfriendly/converter)")
        e.addField("Bot credit", "made by [**Family friendly#6191**](https://familyfriendly.xyz)")
    res.addEmbed(e)
    res.respond()
})

handler.handle(command)
handler.handle(help)
handler.handle(settings)

if(process.argv[2]) {
    const id = process.argv[2] == "global" ? null : process.argv[2]
    help.addToDiscord(id)
    command.addToDiscord(id)
    settings.addToDiscord(id)
}

