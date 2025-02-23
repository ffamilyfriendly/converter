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
      text: 'i just bought a new lambo.. cost 2 BTC and $5 for gas',
    },
    {
      text: "it's currently 21:22 here. In the US its 3:30pm ",
    },
  ]

  for (const test of test_cases) {
    let result = await convert_from_text(test.text, 'sek')
    console.log(`"${test.text}"`, result)
  }
}

tests()
