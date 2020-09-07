// import * as speech from '@google-cloud/speech'
import * as React from 'react'
import * as ReactDOM from 'react-dom'

// const recorder = require('node-record-lpcm16')

// process.env.GOOGLE_APPLICATION_CREDENTIALS = process.cwd() + '/keys.json'

// /**
//  * Note: Correct microphone settings is required: check enclosed link, and make
//  * sure the following conditions are met:
//  * 1. SoX must be installed and available in your $PATH- it can be found here:
//  * http://sox.sourceforge.net/
//  * 2. Microphone must be working
//  * 3. Encoding, sampleRateHertz, and # of channels must match header of audio file you're
//  * recording to.
//  * 4. Get Node-Record-lpcm16 https://www.npmjs.com/package/node-record-lpcm16
//  * More Info: https://cloud.google.com/speech-to-text/docs/streaming-recognize
//  */

// // const encoding = 'LINEAR16';
// // const sampleRateHertz = 16000;
// // const languageCode = 'en-US';

// function microphoneStream (encoding: 'LINEAR16' = 'LINEAR16', sampleRateHertz: number = 16000, languageCode: 'en-US' = 'en-US') {
//   const request = {
//     config: {
//       encoding: encoding,
//       sampleRateHertz: sampleRateHertz,
//       languageCode: languageCode
//     },
//     interimResults: false // Get interim results from stream
//   }

//   // Creates a client
//   const client = new speech.SpeechClient()

// //   // Create a recognize stream
//   const recognizeStream = client
//     .streamingRecognize(request)
//     .on('error', console.error)
//     .on('data', data =>
//       console.log(
//         data.results[0] && data.results[0].alternatives[0]
//           ? `Transcription: ${data.results[0].alternatives[0].transcript}\n`
//           : '\n\nReached transcription time limit, press Ctrl+C\n'
//       )
//     )

//   // Start recording and send the microphone input to the Speech API
//   recorder
//     .record({
//       sampleRateHertz: sampleRateHertz,
//       threshold: 0, // silence threshold
//       recordProgram: 'rec', // Try also "arecord" or "sox"
//       silence: '5.0' // seconds of silence before ending
//     })
//     .stream()
//     .on('error', console.error)
//     .pipe(recognizeStream)

//   console.log('Listening, press Ctrl+C to stop.')
//   // [END micStreamRecognize]
// }

const App = () => {
  const [text, setText] = React.useState('')

  function microphoneStream () {
    // [START micStreamRecognize]

    // Node-Record-lpcm16
    const recorder = require('node-record-lpcm16')

    const request = {
      config: {
        encoding: 'LINEAR16' as 'LINEAR16',
        sampleRateHertz: 16000,
        languageCode: 'ru-RU'
      },
      interimResults: false // Get interim results from stream
    }

    // Creates a client
    // const client = new speech.SpeechClient()

    // // Create a recognize stream
    // const recognizeStream = client
    //   .streamingRecognize(request)
    //   .on('error', console.error)
    //   .on('data', (data: any) =>
    //     data.results[0] && data.results[0].alternatives[0]
    //       ? setText(text + ' ' + data.results[0].alternatives[0].transcript)
    //       : setText(text + ' ' + 'Reached transcription time limit')
    //   )

    // Start recording and send the microphone input to the Speech API
    recorder
      .record({
        sampleRateHertz: 16000,
        threshold: 0, // silence threshold
        recordProgram: 'sox', // Try also "arecord" or "sox"
        silence: '5.0' // seconds of silence before ending
      })
      .stream()
      .on('error', console.error)
      .pipe(require('fs').createWriteStream('test.wav', { encoding: 'binary' }))

    // [END micStreamRecognize]
  }

  // const [devices, setDevices] = React.useState<MediaDeviceInfo[]>([])

  // React.useEffect(() => {
  //   navigator.mediaDevices.enumerateDevices().then(setDevices)
  // }, [])

  return (
    <div>
      {text}
      <button id="start" onClick={() => {
        microphoneStream()
      }}>
        Start
      </button>
    </div>
  )
}

const rootNode = document.createElement('root')
document.body.append(rootNode)

ReactDOM.render(
  <App />,
  rootNode
)
