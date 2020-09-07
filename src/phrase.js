const { Translate } = require('@google-cloud/translate').v2

class Phrase {
  constructor (text, textLanguage, speecher) {
    this.speecher = speecher
    this.textLanguage = textLanguage.split('_')[0]
    this.systemLanguage = speecher.config.language.split('_')[0]
    this.translations = { [this.textLanguage]: text }
  }

  async localize (target = this.systemLanguage) {
    if (!this.translations[target]) {
      const [translations] = await Phrase.translateClient.translate(this.text(), target)
      this.translations[target] = Array.isArray(translations) ? translations[0] : translations
    }
    return this.translations[target]
  }

  text () {
    return this.translations[this.textLanguage]
  }

  async say () {
    return await this.speecher.say(await this.localize())
  }
}

Phrase.translateClient = new Translate()
module.exports = Phrase
