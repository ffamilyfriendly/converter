const config = require("dotenv").config().parsed,
    { Interaction, InteractionHandler, Embed } = require("./lib/interactions"),
    { unitList, doConversions } = require("./lib/measurements")

const handler = new InteractionHandler(config.TOKEN,"880097206818988043")
const command = new Interaction("MESSAGE","Auto Convert")
const help = new Interaction("CHAT_INPUT","info","displays some info about the bot")

/**
 * 
 * @param {string} data 
 * @returns 
 */
const parseMessage = (data) => {
    const embed = new Embed()
    const concatenated = data.replace(/\.+ |°/gm,"").split(" ").join("").toLowerCase()
    const result = doConversions(concatenated)
    for(let i = 0; i < result.length; i++) {
        if(i >= 25) break;
        embed.addField(`conversion #${i+1}`,`${result[i].from} **➟** ${result[i].to}`)
    }
    console.log(concatenated, result)
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

if(process.argv[2]) {
    const id = process.argv[2] == "global" ? null : process.argv[2]
    help.addToDiscord(id)
    command.addToDiscord(id)
}

