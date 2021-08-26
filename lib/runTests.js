const { doConversions } = require("./measurements")

const testStrings = [
    "69 metric units",
    "69 meters",
    "-90 c",
    "when it is 40 c° outside im happy",
    "I am 5 m tall",
    "I am 5.2m tall",
    "I am 5. 2 tall",
    "yoo!!!!!!!!! im 69'78",
    "Im 98% american born... Im under 170 pounds... shoosh",
    "hahah I will kill ur bot -999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999c"
]

testStrings.forEach(str => {
    console.log(`testing string "${str}"`)
    const concatenated = str.replace("°","").replace(/(?<=\d) /gm,"").toLowerCase() + " "
    console.log(concatenated)
    const found = doConversions(concatenated)
    console.log(found.map(f => `${f.from} -> ${f.to}`).join("\n"))
    console.log("\n")
})