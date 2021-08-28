const db = require("better-sqlite3")("./settings.db")
const cache = new Map()

db.prepare("CREATE TABLE IF NOT EXISTS usersettings (id TEXT PRIMARY KEY, uid TEXT, key TEXT, value TEXT)").run()

const def = {
    currency: {
        default: "eur",
        allowed: [ "AED","AFN","ALL","AMD","ANG","AOA","ARS","AUD","AWG","AZN","BAM","BBD","BDT","BGN","BHD","BIF","BMD","BND","BOB","BRL","BSD","BTC","BTN","BWP","BYN","BYR","BZD","CAD","CDF","CHF","CLF","CLP","CNY","COP","CRC","CUC","CUP","CVE","CZK","DJF","DKK","DOP","DZD","EGP","ERN","ETB","EUR","FJD","FKP","GBP","GEL","GGP","GHS","GIP","GMD","GNF","GTQ","GYD","HKD","HNL","HRK","HTG","HUF","IDR","ILS","IMP","INR","IQD","IRR","ISK","JEP","JMD","JOD","JPY","KES","KGS","KHR","KMF","KPW","KRW","KWD","KYD","KZT","LAK","LBP","LKR","LRD","LSL","LTL","LVL","LYD","MAD","MDL","MGA","MKD","MMK","MNT","MOP","MRO","MUR","MVR","MWK","MXN","MYR","MZN","NAD","NGN","NIO","NOK","NPR","NZD","OMR","PAB","PEN","PGK","PHP","PKR","PLN","PYG","QAR","RON","RSD","RUB","RWF","SAR","SBD","SCR","SDG","SEK","SGD","SHP","SLL","SOS","SRD","STD","SVC","SYP","SZL","THB","TJS","TMT","TND","TOP","TRY","TTD","TWD","TZS","UAH","UGX","USD","UYU","UZS","VEF","VND","VUV","WST","XAF","XAG","XAU","XCD","XDR","XOF","XPF","YER","ZAR","ZMK","ZMW","ZWL" ].map(c => c.toLowerCase())
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