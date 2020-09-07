const AudioRecorder = require('./recorder')
const BumblebeeHotWordDetector = require('bumblebee-hotword-node')
const path = require('path')
const { Readable } = require('stream')
const skills = require('./skills')
const Phrase = require('./phrase')
const notifier = require('node-notifier')
const lunr = require('lunr')
require('lunr-languages/lunr.stemmer.support.js')(lunr)
var player = require('play-sound')({})

module.exports = class Speecher {
  constructor (config) {
    this.config = {
      language: config.speechRecognizer.languageCode || 'ru_RU',
      hotwordDetector: {
        hotword: 'hey_edison',
        ...config.hotwordDetector
      },
      speechRecognizer: {
        encoding: 'LINEAR16',
        languageCode: 'ru_RU',
        sampleRateHertz: 44100,
        enableAutomaticPunctuation: true,
        ...config.speechRecognizer
      }
    }

    this.setupHotwordDetector()
    this.seetupSpeechRegonizer()
    this.setupTextToSpeechClient()
    this.setupFullTextSearch()
  }

  setupFullTextSearch () {
    const lang = this.config.language.split('_')[0]
    if (lang !== 'en') {
      require(`lunr-languages/lunr.${lang}.js`)(lunr)
    }
    this.fullTextSearchIndex = lunr(function () {
      if (lang !== 'en') {
        this.use(lunr[lang])
      }

      // then, the normal lunr index initialization
      this.field('trigger')
      this.ref('name')

      Object.entries(skills).forEach(([name, { triggers }]) => {
        triggers[lang].forEach(trigger => {
          console.log(name, trigger)
          this.add({ name, trigger })
        })
      })
    })
  }

  setupTextToSpeechClient () {
    const textToSpeech = require('@google-cloud/text-to-speech')
    this.textToSpeechClient = new textToSpeech.TextToSpeechClient()
  }

  createAudioRecorder (config) {
    return new AudioRecorder({ rate: 44100, silence: false, ...config }).start()
  }

  playAudio (str) {
    return new Promise((resolve, reject) => {
      player.play(path.resolve(process.cwd(), str), (err) => err ? reject(err) : resolve())
    })
  }

  notification () {
    this.playAudio('./resources/start.mp3')
    return notifier.notify({
      title: 'Speecher Listening',
      message: 'Say something...',
      icon: path.join(__dirname, '../resources/5b1ef8767735d.png') // Absolute path (doesn't work on balloons)
    })
  }

  setupHotwordDetector () {
    const audioRecorder = this.createAudioRecorder()
    audioRecorder.start()
    this.hotwordDetector = new BumblebeeHotWordDetector({ stream: audioRecorder })

    this.hotwordDetector.addHotword(this.config.hotwordDetector.hotword)

    this.hotwordDetector.on('hotword', async () => {
      try {
        this.notification()

        this.hotwordDetector.setMuted(true)

        const phrase = await this.listen()

        console.log('Full text search:', phrase.text())

        const foundeSkills = this.fullTextSearchIndex.search(phrase.text())

        if (foundeSkills.length > 0) {
          await skills[foundeSkills[0].ref].run(this, phrase)
        } else {
          await skills.default.run(this, phrase)
        }
      } catch (error) {
        console.log(error.message)
      } finally {
        console.log(`Conversation finished. Listening for hotword ${this.config.hotwordDetector.hotword}`)
        this.hotwordDetector.setMuted(false)
      }
    })
  }

  seetupSpeechRegonizer () {
    this.speechRecognizerClient = new (require('@google-cloud/speech')).SpeechClient()
  }

  async say (text) {
    const [{ audioContent }] = await this.textToSpeechClient.synthesizeSpeech({
      input: { text },
      voice: { languageCode: this.config.speechRecognizer.languageCode, ssmlGender: 'NEUTRAL' },
      audioConfig: { audioEncoding: 'LINEAR16' }
    })

    console.log('Saying: ' + text)

    await this.playAudio(Readable.from(audioContent))
  }

  createPhrase (text, language = this.config.language) {
    return new Phrase(text, language, this)
  }

  listen (audioRecorder = this.createAudioRecorder()) {
    return new Promise((resolve, reject) => {
      const regonitionStream = this.speechRecognizerClient.streamingRecognize({ config: this.config.speechRecognizer })
        .on('data', ({ results: [results] }) => {
          clearTimeout(stopTimeout)
          if (!results || !results.alternatives[0]) {
            reject(new Error('Reached transcription time limit'))
          }

          if (results.isFinal) {
            console.log('You said:', results.alternatives[0].transcript)
            resolve(this.createPhrase(results.alternatives[0].transcript))
            regonitionStream.destroy()
            audioRecorder.stop()
          }
        })
        .on('error', reject)

      audioRecorder.stream().pipe(regonitionStream)

      const stopTimeout = setTimeout(() => {
        regonitionStream.destroy()
        reject(new Error('User did not say anything'))
      }, 8000)

      console.log('Listening:')
    })
  }

  start () {
    this.hotwordDetector.start()

    console.log(`Listening for hotword ${this.config.hotwordDetector.hotword}`)
  }
}
