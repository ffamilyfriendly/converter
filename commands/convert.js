const { Interaction, InteractionHandler, Embed, Option } = require("../lib/interactions"),
    { doConversions } = require("../lib/measurements")
const command = new Interaction("MESSAGE","Auto Convert")

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

module.exports = command