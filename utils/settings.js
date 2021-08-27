const def = {
    currency: {
        default: "eur",
        allowed: [ "eur", "usd", "sek" ]
    }
}

const isValidSetting = (setting, value) => {
    return def[setting].allowed.includes(value)
}

module.exports = { def, isValidSetting }