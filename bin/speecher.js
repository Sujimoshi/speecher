#! /usr/bin/env node
const { resolve } = require('path')

require('yargs') // eslint-disable-line
  .command({
    command: 'start',
    builder: {
      googleCloudKeys: {
        alias: 'c',
        default: './keys.json'
      },
      hotword: {
        alias: 'h',
        default: 'hey_edison'
      },
      languageCode: {
        alias: 'l',
        default: 'ru-RU',
        global: true,
        requiresArg: true,
        type: 'string'
      }
    },
    handler: ({ hotword, languageCode, googleCloudKeys }) => {
      process.env.GOOGLE_APPLICATION_CREDENTIALS = resolve(process.cwd(), googleCloudKeys)

      const Speecher = require('../src/index')
      const speecher = new Speecher({
        googleCloudKeys,
        hotwordDetector: {
          hotword
        },
        speechRecognizer: {
          languageCode
        }
      })

      speecher.start()
    }
  })
  .help()
  .argv
