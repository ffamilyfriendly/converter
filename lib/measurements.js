const whyDoYankeesExist = (t) => {
    const inchesToFeet = t.split("'")[1] / 12
    return Number(t.split("'")[0]) + inchesToFeet
}

const unitList = new Map([
    ["pounds", {
        regex: /(\d+)(lbs|lb|pounds|pound)/gm,
        convert: (t) => t * 0.45359237,
        conversionUnit: "kg"
    }],
    ["kg", {
        regex: /(\d+)(kgs|kg|kilograms|kilogram)/gm,
        convert: (t) => t * 2.205, 
        conversionUnit: "pounds"
    }],
    ["cm", {
        regex: /(\d+)(cms|cm|centimeters|centimeter)/gm,
        convert: (t) => t / 2.54, 
        conversionUnit: "inches"
    }],
    ["feet", {
        regex: /(\d+'\d+)|(\d+)(feet|foot|ft)/gm,
        convert: (t) => t.includes("'") ? whyDoYankeesExist(t) / 3.281 : t / 3.281, 
        conversionUnit: "meters"
    }],
    ["inches", {
        regex: /(\d+)(inches|inch|" )/gm,
        convert: (t) => t * 2.54, 
        conversionUnit: "centimeters"
    }],
    ["meters", {
        regex: /([0-9,.]+)(meters|meter|m )/gm,
        convert: (t) => t * 3.281,
        conversionUnit: "feet"
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
            converted.push({ from:`**${match[1]}** ${name}`, to: `**${value.convert(match[1]).toFixed(value.decimals||2)}** ${value.conversionUnit}` })
        }
    }
    return converted.reverse()
}

module.exports = { unitList, doConversions }