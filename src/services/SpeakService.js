// src/services/SpeakService.js
import { SpeechClient } from '@google-cloud/speech';
import { TextToSpeechClient } from '@google-cloud/text-to-speech';
import { GoogleGenerativeAI } from '@google/generative-ai';
import config from '../config/config.js';
import { createLogger } from '../utils/logger.js';

const log = createLogger('speak');

// --- INITIALIZE CLIENTS ---
const speechClient = new SpeechClient();
const ttsClient = new TextToSpeechClient();
const genAI = new GoogleGenerativeAI(config.GEMINI_API_KEY);
const geminiModel = genAI.getGenerativeModel({ model: 'gemini-pro' });

const handleNewConnection = (socket) => {
  let recognizeStream = null;

  const startStream = () => {
    log.info('Starting speech recognition stream...');
    recognizeStream = speechClient
      .streamingRecognize({
        config: {
          encoding: 'WEBM_OPUS', // This needs to match the client's audio format
          sampleRateHertz: 48000, // This needs to match the client's audio
          languageCode: 'en-US',
          enableAutomaticPunctuation: true,
        },
        interimResults: true,
      })
      .on('error', (err) => {
        log.error('Recognition Stream Error:', err);
        socket.emit('error', { message: 'Error with speech recognition.' });
      })
      .on('data', (data) => {
        if (data.results[0] && data.results[0].alternatives[0]) {
          if (data.results[0].isFinal) {
            const transcript = data.results[0].alternatives[0].transcript;
            log.debug(`Final Transcript: ${transcript}`);
            socket.emit('final_transcript', { data: transcript });
            
            // Send transcript to Gemini and handle the response stream
            getAITutorResponse(transcript, socket);

          } else {
            const transcript = data.results[0].alternatives[0].transcript;
            // Omit logging interim results for cleaner logs, client still gets them
            socket.emit('interim_transcript', { data: transcript });
          }
        }
      });
  };

  const getAITutorResponse = async (transcript, socket) => {
    log.debug('Sending to Gemini:', transcript);
    let fullResponse = '';
    try {
      const prompt = `You are an IELTS speaking examiner. The user just said: "${transcript}". Respond to them conversationally.`;
      const result = await geminiModel.generateContentStream(prompt);
      
      const ttsPromise = new Promise(async (resolve, reject) => {
          let ttsChunks = [];
          for await (const chunk of result.stream) {
              const textChunk = chunk.text();
              fullResponse += textChunk;
              // Stream AI text response back to client
              socket.emit('ai_response_chunk', { data: textChunk });
              ttsChunks.push(textChunk);
          }
              log.debug('Synthesizing audio for:', fullResponse);
          synthesizeAndStreamAudio(fullResponse, socket);
          resolve();
      });

      await ttsPromise;

    } catch (error) {
      log.error('Gemini or TTS Error:', error);
      socket.emit('error', { message: 'Error generating AI response.' });
    }
  };

  const synthesizeAndStreamAudio = async (text, socket) => {
    try {
      const request = {
        input: { text: text },
        voice: { languageCode: 'en-US', ssmlGender: 'NEUTRAL' },
        audioConfig: { audioEncoding: 'MP3' }, // Send MP3 audio to the client
      };

      const [response] = await ttsClient.synthesizeSpeech(request);
      // Stream audio data back to the client
      socket.emit('audio_chunk', { data: response.audioContent.toString('base64') });
      log.debug('Finished streaming audio.');
    } catch (error) {
      log.error('TTS Synthesis Error:', error);
      socket.emit('error', { message: 'Error synthesizing audio response.' });
    }
  };


  const endStream = () => {
    if (recognizeStream) {
      log.info('Ending speech recognition stream.');
      recognizeStream.end();
    }
    recognizeStream = null;
  };

  socket.on('start_stream', () => {
    startStream();
  });

  socket.on('audio_chunk', (chunk) => {
    if (recognizeStream && !recognizeStream.destroyed) {
      recognizeStream.write(chunk);
    }
  });

  socket.on('end_stream', () => {
    endStream();
  });

  socket.on('disconnect', () => {
    endStream(); // Clean up on disconnect
  });
};

export { handleNewConnection };
