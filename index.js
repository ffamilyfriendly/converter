const config = require("dotenv").config().parsed,
    { Interaction, InteractionHandler, InteractionResponse } = require("./lib/interactions")

const handler = new InteractionHandler(config.TOKEN,"880097206818988043")
const command = new Interaction("MESSAGE","Auto Convert")

/**
 * 
 * @param {InteractionResponse} res 
 */
command.onUsed = (res) => {
    res.content = "works!"
    res.respond()
}
handler.handle(command)

// command.addToDiscord("874566459429355581")
//     .then(res => console.log(res))
//     .catch(err => console.error(err))