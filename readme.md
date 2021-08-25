# Converter
adds "Auto Convert" to message context menu. Running that command will give you and embed with any units the bot could parse in the selected message and their conversion to the biggest alternative unit ( si units -> yankee units and the other way around )

## my instance
https://discord.com/api/oauth2/authorize?client_id=880097206818988043&permissions=0&scope=bot%20applications.commands

## host your own
to host your own instance you need to:
* clone this repo
* rename example.env to .env
* configure your discord application (add interaction url to whatever port you configured in .env)
* run the bot!
  
### register commands
to register commands you need to start the bot with the first argument being either a server id or global for adding the commands globaly.

**adding server specific commands (for debugging):**
`node . 874566459429355581` with "874566459429355581" being your server

**adding commands globally:**
`node . global`

**do note:**
you dont need to register commands every time you start the bot. The only time you should pass arguments is if you have changed any code related to any command or if you start the bot for the first time