const config = require("dotenv").config().parsed,
    fetch = require("node-fetch"),
    fs = require("fs"),
    { getUserSettings } = require("./settings")
let rates = null

// https://exchangeratesapi.io/
const fetchLatestExchange = () => {
    console.log("fetching exchange")
    fetch(`http://api.exchangeratesapi.io/v1/latest?access_key=${config.ACCESSKEY}`)
        .then(p => p.json())
        .then(data => {
            console.log(data)
            if(data?.error) {
                throw new Error(`${data.error.code}: ${data.error.message}`)
            }
            if(!data?.success) throw new Error(`could not get exchange rates. `)
            fs.writeFileSync("./data.json", JSON.stringify(data))
        })
}


const startLoop = () => {
    const data = fs.existsSync("./data.json") ? JSON.parse(fs.readFileSync("./data.json")) : null
    if(!data || data.timestamp + 1000 * 60 * 60 * 12 < Date.now()/1000)  fetchLatestExchange()
    rates = data
    setInterval(fetchLatestExchange, (1000 * 60 * 60 * 12) + 1000)
}

const shorthand = (unit) => {
    const definitions = {
        "$": "usd",
        "£": "gbp",
        "€": "eur"
    }
    return definitions[unit] || unit
}

const convert = (t, rMatch, user) =>  {
    const [ beforeNumber, afterNumber ] = [ rMatch[3], rMatch[4] ]
    const toCurr = getUserSettings(user.id, "currency")
    const fromCurr = shorthand(beforeNumber || afterNumber)
    if(toCurr == fromCurr || !rates.rates[fromCurr.toUpperCase()]) return false
    const curr = Number(t.match(/\d+/gm)[0])
    const inEur = curr / rates.rates[fromCurr.toUpperCase()]
    const inSelCurr = (inEur * rates.rates[toCurr.toUpperCase()]).toFixed(2)

    return `${inSelCurr} ${toCurr}`

}

module.exports = { startLoop, convert }