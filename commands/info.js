const { Interaction, InteractionHandler, Embed, Option } = require("../lib/interactions")
const command = new Interaction("CHAT_INPUT","info","displays some info about the bot")

command.onUsed((res) => {
    const e = new Embed()
        e.addField("Converter","version **1.0,0**")
        e.addField("Github","**🐛 report bugs:** [click here!](https://github.com/ffamilyfriendly/converter/issues/new?assignees=&labels=bug&template=bug_report.md&title=Bug)\n✨ **suggest feature:** [click here!](https://github.com/ffamilyfriendly/converter/issues/new?assignees=&labels=enhancement&template=feature_request.md&title=)\n🤓 **github repo:** [ffamilyfriendly/converter](https://github.com/ffamilyfriendly/converter)")
        e.addField("Bot credit", "made by [**Family friendly#6191**](https://familyfriendly.xyz)")
    res.addEmbed(e)
    res.respond()
})

module.exports = command