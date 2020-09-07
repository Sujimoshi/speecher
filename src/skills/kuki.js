const fetch = require('node-fetch')

module.exports = {
  triggers: {
    ru: ['Привет', 'Как дела', 'Чем занимаешся'],
    en: ['Hello', 'How are you', 'What are you doing']
  },
  run: async (speecher, initPhrase) => {
    const kuki = async (messagePhrase) => {
      const { responses: [response] } = await fetch('https://miapi.pandorabots.com/talk', {
        headers: {
          Accept: '*/*',
          'Accept-Encoding': 'gzip, deflate, br',
          'Accept-Language': 'en-GB,en-US;q=0.9,en;q=0.8,ru;q=0.7',
          Connection: 'keep-alive',
          'Content-Length': '152',
          'Content-type': 'application/x-www-form-urlencoded',
          Host: 'miapi.pandorabots.com',
          Origin: 'https://www.pandorabots.com',
          Referer: 'https://www.pandorabots.com/kuki/',
          'Sec-Fetch-Dest': 'empty',
          'Sec-Fetch-Mode': 'cors',
          'Sec-Fetch-Site': 'same-site',
          'User-Agent': 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/85.0.4183.83 Safari/537.36'
        },
        body: `input=${await messagePhrase.localize('en')}&sessionid=404649068&channel=6&botkey=n0M6dW2XZacnOgCWTp0FRYUuMjSfCkJGgobNpgPv9060_72eKnu3Yl-o1v2nFGtSXqfwJBG2Ros~&client_name=kukilp-17463c93210`,
        method: 'POST'
      }).then(res => {
        return res.json()
      })

      return speecher.createPhrase(response, 'en')
    }

    const kukiFirstPhrase = await kuki(initPhrase)
    await kukiFirstPhrase.say()

    while (true) {
      const userPhrase = await speecher.listen()

      const kukiPhrase = await kuki(userPhrase)

      await kukiPhrase.say()
    }
  }
}
