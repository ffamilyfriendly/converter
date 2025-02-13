import { convert_from_text } from './convertions'
import dotenv from 'dotenv'

dotenv.config()

const tests = async () => {
  const test_cases = [
    {
      text: 'bro fuck this dev lmao i am five miles from hell',
    },
    {
      text: 'got damn bro its 50°F down in arizona?? Up in montana we got 125°',
    },
    {
      text: 'in sweden its -4 c and i only have $3 on my bank account :( my mate has 4€ ',
    },
    {
      text: 'heya! I am 197cm tall. My little bro is 30cm but he lives 16100 cm away. Let us walk 50 meters ',
    },
    {
      text: 'i drove 50km/h today :D My mate said he drove 100 mph but idk what that is',
    },
    {
      text: 'yo i drove my car at like fucking 447 km/s today xd #yolo',
    },
  ]

  for (const test of test_cases) {
    let result = await convert_from_text(test.text, 'sek')
    console.log(`"${test.text}"`, result)
  }
}

tests()
