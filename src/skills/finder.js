const open = require('open')

module.exports = {
  triggers: {
    en: ['Find in the interner'],
    ru: ['Найди в интернете']
  },
  run: async (speecher, initPhrase) => {
    speecher.say('Назовите запрос')

    const query = await speecher.listen()

    if (initPhrase.text().includes('google') || initPhrase.text().includes('гугл')) {
      open(`https://www.google.com/search?q=${query.text()}`)
    } else {
      open(`https://duckduckgo.com/?q=!ducky+${query.text()}`)
    }
  }
}
