const config = require("dotenv").config().parsed,
    { Interaction, InteractionHandler, InteractionResponse, Embed } = require("./lib/interactions")

const handler = new InteractionHandler(config.TOKEN,"880097206818988043")
const command = new Interaction("MESSAGE","Auto Convert")
const help = new Interaction("CHAT_INPUT","info","displays some info about the bot")

const parseMessage = (data) => {
    const embed = new Embed()
    embed.description = data
    return embed
}

command.onUsed((res) => {
    const embed = parseMessage(res.message.content)
    embed.title = `${res.message.author.username}#${res.message.author.discriminator}`
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

//help.addToDiscord("874566459429355581")

// command.addToDiscord("874566459429355581")
//     .then(res => console.log(res))
//     .catch(err => console.error(err))