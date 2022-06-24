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
    "hahah I will kill ur bot -999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999c",
    "yooo why is it 24am??",
    "why is it 4am?",
    "why is it 4:30am?",
    "why is it 12:40pm or 12:00am",
    "asddfhghfj 12:40am 3am",
    "why is it 3pm",
    "why is it 12:00 already or 24:00",
    "no, 74.4 inches is 188.976 cm",
    "no, 74,4 inches is 188.976 cm"
]

testStrings.forEach(str => {
    console.log(`testing string "${str}"`)
    const concatenated = str.replace("°","").replace(/(?<=\d) /gm,"").toLowerCase() + " "
    console.log(concatenated)
    const found = doConversions(concatenated)
    console.log(found.map(f => `${f.from} -> ${f.to}`).join("\n"))
    console.log("\n")
})