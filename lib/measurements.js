const whyDoYankeesExist = (t) => {
    const inchesToFeet = t.split("'")[1] / 12
    return Number(t.split("'")[0]) + inchesToFeet
}

/**
 * 
 * @param {string} str the string to pad
 * @param {string} char the character to pad with
 * @param {number} len how long the finished string should be 
 */
const pad = (str, char = "0", len = 2) => {
    console.log
    return char.repeat(Math.max(len - str.length, 0)) + str
}

const mToAmerican = (m) => {
    const feet = m * 3.281
    if(feet < 1) return ((m * 100) / 2.54)
    const inches = (feet % 1) * 12
    // this aint to accurate but I dont think the yankees will notice lol
    return `${Math.floor(feet)}'${Math.floor(inches)}"`
}

const unitList = new Map([
    ["pounds", {
        regex: /([0-9,.]+)(lbs|lb|pounds|pound)/gm,
        convert: (t) => t * 0.45359237,
        conversionUnit: "kg"
    }],
    ["kg", {
        regex: /([0-9,.]+)(kgs|kg|kilograms|kilogram)/gm,
        convert: (t) => t * 2.205, 
        conversionUnit: "pounds"
    }],
    ["cm", {
        regex: /([0-9,.]+)(cms|cm|centimeters|centimeter)/gm,
        convert: (t) => {
            return mToAmerican(t / 100)
        }, 
        conversionUnit: "inches"
    }],
    ["feet", {
        regex: /(\d+'\d+)|(\d+)(feet|foot|ft)/gm,
        convert: (t) => t.includes("'") ? whyDoYankeesExist(t) / 3.281 : t / 3.281, 
        conversionUnit: "meters"
    }],
    ["inches", {
        regex: /([0-9,.]+)(inches|inch|" )/gm,
        convert: (t) => t.replace(",", ".") * 2.54, 
        conversionUnit: "centimeters"
    }],
    ["meters", {
        regex: /([0-9,.]+)(meters|meter|m )/gm,
        convert: (t) => {
            return mToAmerican(t)
        },
        conversionUnit: "feet"
    }],
    ["kilometers", {
        regex: /([0-9,.]+)(kilometers|kilometer|km |kms )/gm,
        convert: (t) => t / 1.609,
        conversionUnit: "miles"
    }],
    ["miles", {
        regex: /([0-9,.]+)(miles|mile)/gm,
        convert: (t) => t * 1.609,
        conversionUnit: "km"
    }],
    ["fahrenheit", {
        regex: /(-[0-9,.]+|[0-9,.]+)(fahrenheit|f )/gm,
        convert: (t) => (t - 32) * 5/9,
        conversionUnit: "°C"
    }],
    ["celcius", {
        regex: /(-[0-9,.]+|[0-9,.]+)(celcius|c )/gm,
        convert: (t) => (t * 9/5) + 32,
        conversionUnit: "°F"
    }],
    ["normal time", {
        regex: /([0-2][0-9]:[0-9][0-9])( |(?!(am|pm)))/gm,
        convert: t => {
            const [hours, minutes] = t.split(":")
            let unit = Number(hours) <= 12 ? "AM" : "PM"
            const convertedHours = hours % 12
            return `${convertedHours == 0 ? 12 : convertedHours}:${minutes} ${unit}`
        },
        conversionUnit: "" // leaving this blank as I need to know if it is AM or PM
    }],
    ["yankee time", {
        regex: /(?= |)((((1[0-2]|[0-9]))|(0?[1-9]|1[0-2]):([0-5]\d))(?<f>am|pm))/gm, /* I cannot believe the notion that there is a posibility of a loving God after writing this abhorent fucking regex. Thanks to https://regexland.com/regex-time-am-pm/ for making the first part easy*/
        convert: (t, rMatch) => {
            const format = rMatch.groups.f
            t = t.slice( 0, -2 )
            const [hours, minutes] = (t.includes(":") ? t.split(":") : [t,0])
            return `${pad((format == "pm" ? (hours == 12 ? hours : Number(hours) + 12) : (hours == 12 ? 0 : hours)).toString())}:${pad(minutes.toString())}`
        },
        conversionUnit: "" // leaving this blank as sane people dont use AM or PM
    }]
])

/**
 * 
 * @param {string} data 
 */
const doConversions = (data) => {
    const converted = []
    for(const [name, value] of unitList) {
        const matches = data.matchAll(value.regex)
        for(const match of matches) {
            const unitConversion = value.convert(match[1], match)
            converted.push({ from:`**${match[1]}** ${name}`, to: `**${typeof unitConversion == "number" ? unitConversion.toFixed(value.decimals||2) : unitConversion}** ${value.conversionUnit}` })
        }
    }
    return converted.reverse()
}

module.exports = { unitList, doConversions }