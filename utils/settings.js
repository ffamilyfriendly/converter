const db = require("better-sqlite3")("./settings.db")
const cache = new Map()

db.prepare("CREATE TABLE IF NOT EXISTS usersettings (id TEXT PRIMARY KEY, uid TEXT, key TEXT, value TEXT)").run()

const def = {
    currency: {
        default: "eur",
        allowed: [ "eur", "usd", "sek" ]
    }
}

const isValidSetting = (setting, value) => {
    return def[setting].allowed.includes(value)
}

const ensureUserCached = (uid) => {
    if(!cache.has(uid)) {
        let settings = {}
        const rows = db.prepare("SELECT * FROM usersettings WHERE uid = ?").all(uid)
        for(let i = 0; i < rows.length; i++) {
            const setting = rows[i]
            settings[setting.key] = setting.value
        }
        cache.set(uid, settings)
    }
}

const setUserSettings = (uid, key, value) => {
    ensureUserCached(uid)
    db.prepare("REPLACE INTO usersettings VALUES(?,?,?,?)").run(`${uid}#${key}`,uid, key, value)
    const curr = cache.get(uid)
    curr[key] = value
}

const getUserSettings = (uid, key) => {
    ensureUserCached(uid)
    const uSettings = cache.get(uid)
    return uSettings[key] || def[key].default
}

module.exports = { def, isValidSetting, getUserSettings, setUserSettings }