// Speaking Practice Service - AI-powered speech analysis
import Groq from 'groq-sdk';
import axios from 'axios';
import FormData from 'form-data';
import fs from 'fs';
import path from 'path';

class SpeakingPracticeService {
    constructor() {
        this.groqClient = new Groq({
            apiKey: process.env.GROQ_API_KEY
        });
    }

    /**
     * Transcribe audio using Whisper (via Groq)
     */
    async transcribeAudio(audioFilePath) {
        try {
            const formData = new FormData();
            formData.append('file', fs.createReadStream(audioFilePath));
            formData.append('model', 'whisper-large-v3');
            formData.append('language', 'en');
            formData.append('response_format', 'verbose_json');

            const response = await axios.post(
                'https://api.groq.com/openai/v1/audio/transcriptions',
                formData,
                {
                    headers: {
                        'Authorization': `Bearer ${this.groqClient.apiKey}`,
                        ...formData.getHeaders()
                    }
                }
            );

            return {
                text: response.data.text,
                duration: response.data.duration,
                language: response.data.language
            };
        } catch (error) {
            console.error('Transcription error:', error.response?.data || error.message);
            throw new Error('Failed to transcribe audio');
        }
    }

    /**
     * Analyze grammar, pronunciation, and provide teacher-like feedback
     */
    async analyzeSpoken(transcribedText, practiceMode = 'conversation', topic = null, contextInfo = null) {
        const systemPrompt = this.getSystemPrompt(practiceMode);

        // Build context string if available
        let contextString = '';
        if (contextInfo) {
            if (contextInfo.time && contextInfo.date) {
                contextString += `\nCurrent time: ${contextInfo.time.formatted} on ${contextInfo.date}`;
            }
            if (contextInfo.location && contextInfo.weather) {
                contextString += `\nLocation: ${contextInfo.location}`;
                contextString += `\nWeather: ${contextInfo.weather.temperature}°C, ${contextInfo.weather.condition}`;
            }
        }

        const userPrompt = `
You are a certified IELTS examiner with 10+ years of experience. Analyze this spoken English text with STRICT IELTS band descriptors.

**Student's Speech:** "${transcribedText}"
**Topic:** ${topic || 'General conversation'}
${contextString}

CRITICAL ASSESSMENT RULES:
1. **TOPIC RELEVANCE CHECK**: First, determine if the student's response is relevant to the topic.
   - If topic is "General English Practice" or similar: Skip off-topic check, focus on language quality only
   - If OFF-TOPIC or IRRELEVANT to specific topic: Give ALL scores as 0.0 and explain in feedback why it's off-topic
   - If PARTIALLY RELEVANT: Reduce all scores significantly (max 3.0-4.0)
   - If ON-TOPIC: Proceed with strict IELTS assessment

2. **STRICT IELTS SCORING CRITERIA** (0-9 scale):
   - Band 9: Expert user (near-perfect, native-like)
   - Band 8: Very good user (rare mistakes, fluent)
   - Band 7: Good user (occasional errors, generally fluent) 
   - Band 6: Competent user (some errors, basic communication maintained)
   - Band 5: Modest user (frequent errors, partial communication)
   - Band 4: Limited user (very frequent errors, basic phrases only)
   - Band 3-0: Extremely limited to non-user

3. **DEDUCT POINTS FOR**:
   - Each grammar error: -0.5 to -1.0 points
   - Each pronunciation error: -0.3 to -0.8 points
   - Short response (less than 3 sentences): -1.0 to -2.0 points
   - Lack of details/examples: -0.5 to -1.5 points
   - Simple vocabulary only: -1.0 to -2.0 points
   - No discourse markers: -0.5 to -1.0 points
   - Repetitive language: -0.5 to -1.0 points

4. **REALISTIC SCORE RANGES**:
   - Most non-native speakers: 4.0 - 6.5
   - Good speakers with mistakes: 6.0 - 7.0
   - Very good speakers: 7.0 - 7.5
   - Near-native/advanced: 7.5 - 8.5
   - Native-like (very rare): 8.5 - 9.0

Provide comprehensive analysis in this JSON format:
{
  "off_topic": false,
  "topic_relevance_explanation": "Brief explanation of topic relevance",
  "pronunciation_errors": [
    {
      "word": "specific word mispronounced",
      "incorrect": "how they said it phonetically",
      "correct": "correct pronunciation",
      "ipa": "IPA notation /.../" ,
      "difficulty": "BASIC | INTERMEDIATE | ADVANCED",
      "tip": "specific technique to fix"
    }
  ],
  "grammar_errors": [
    {
      "error": "exact error from their speech",
      "correction": "corrected version",
      "explanation": "grammar rule violated + why it's wrong",
      "difficulty": "BASIC | INTERMEDIATE | ADVANCED",
      "grammar_type": "Tense | Article | Subject-Verb Agreement | etc.",
      "example": "correct example sentence"
    }
  ],
  "vocabulary_analysis": {
    "basic_words_used": ["list of A1-A2 words used"],
    "intermediate_words_used": ["list of B1-B2 words used"],
    "advanced_words_used": ["list of C1-C2 words used"],
    "vocabulary_level": "BASIC | INTERMEDIATE | ADVANCED",
    "suggestions": "Vocabulary improvement suggestions"
  },
  "corrected_text": "Fully corrected version maintaining their meaning",
  "scores": {
    "pronunciation": 0.0,
    "grammar": 0.0,
    "fluency": 0.0,
    "vocabulary": 0.0,
    "overall": 0.0
  },
  "scoring_justification": {
    "pronunciation": "Why this score (mention specific issues)",
    "grammar": "Why this score (cite specific errors)",
    "fluency": "Why this score (hesitations, pace, coherence)",
    "vocabulary": "Why this score (range, accuracy, appropriacy)"
  },
  "skill_weaknesses": [
    {
      "skill": "Pronunciation | Grammar | Vocabulary | Fluency",
      "current_band": "X.X",
      "weakness_level": "CRITICAL | HIGH | MODERATE | LOW",
      "specific_issues": ["list of specific problems"],
      "improvement_priority": "Focus on this first/second/third",
      "practice_suggestions": "Concrete practice advice"
    }
  ],
  "teacher_response": "A realistic teacher comment addressing their performance (2-3 sentences)"
}

BE STRICT, ACCURATE, and FAIR like a real IELTS examiner. Do not over-score. Most responses should be 4.5-6.5 range unless truly excellent.
`;

        try {
            const completion = await this.groqClient.chat.completions.create({
                messages: [
                    { role: 'system', content: systemPrompt },
                    { role: 'user', content: userPrompt }
                ],
                model: 'llama-3.3-70b-versatile',
                temperature: 0.3, // Lower for more consistent grading
                max_tokens: 2000,
                response_format: { type: 'json_object' }
            });

            const analysis = JSON.parse(completion.choices[0].message.content);
            return analysis;
        } catch (error) {
            console.error('Analysis error:', error);
            throw new Error('Failed to analyze speech');
        }
    }

    /**
     * Generate conversational AI response
     */
    async generateTeacherResponse(transcribedText, conversationHistory = [], practiceMode = 'conversation', contextInfo = null) {
        const systemPrompt = this.getConversationPrompt(practiceMode);

        // Build context string if available
        let contextString = '';
        if (contextInfo) {
            if (contextInfo.time && contextInfo.date) {
                contextString += `Current time: ${contextInfo.time.formatted} on ${contextInfo.date}. `;
            }
            if (contextInfo.location && contextInfo.weather) {
                contextString += `You are in ${contextInfo.location}. Weather is ${contextInfo.weather.temperature}°C, ${contextInfo.weather.condition}. `;
            }
            contextString += 'Incorporate this context naturally into your response when relevant.';
        }

        const messages = [
            { role: 'system', content: systemPrompt + (contextString ? `\n\n${contextString}` : '') },
            ...conversationHistory.slice(-8), // Last 4 exchanges
            { role: 'user', content: transcribedText }
        ];

        try {
            const completion = await this.groqClient.chat.completions.create({
                messages,
                model: 'llama-3.3-70b-versatile',
                temperature: 0.7,
                max_tokens: 200
            });

            return completion.choices[0].message.content;
        } catch (error) {
            console.error('Response generation error:', error);
            throw new Error('Failed to generate response');
        }
    }

    /**
     * Convert text to speech with voice selection
     */
    async textToSpeech(text, voiceGender = 'female', language = 'en') {
        try {
            // Using gTTS-like approach with ElevenLabs or Azure TTS
            // For now, return the text and let frontend use Web Speech API
            // Or integrate with Azure Cognitive Services TTS
            
            // Using Google Cloud TTS would be ideal:
            // const { TextToSpeechClient } = require('@google-cloud/text-to-speech');
            
            // Placeholder: Return instructions for client-side TTS
            return {
                text,
                voiceGender,
                useClientTTS: true, // Use browser's Speech Synthesis API
                voiceName: voiceGender === 'male' ? 'Google UK English Male' : 'Google UK English Female'
            };
        } catch (error) {
            console.error('TTS error:', error);
            throw new Error('Failed to generate speech');
        }
    }

    /**
     * System prompts for different practice modes
     */
    getSystemPrompt(mode) {
        const prompts = {
            conversation: `You are a certified IELTS examiner with 10+ years of experience assessing thousands of candidates. 

YOUR ROLE:
- Apply STRICT IELTS band descriptors (0-9 scale)
- Check topic relevance FIRST - give 0.0 for off-topic responses
- Be REALISTIC with scores - most learners score 4.0-6.5
- Identify EVERY pronunciation error with IPA notation
- Catch ALL grammar mistakes with detailed explanations
- Assess vocabulary range and accuracy critically
- Evaluate fluency, coherence, and discourse markers

SCORING PHILOSOPHY:
- Band 6.0-6.5: Typical competent user (some errors but communicates)
- Band 7.0+: Requires very good English with rare errors
- Band 8.0+: Near-native fluency (exceptional cases only)
- Give 0.0 for ALL scores if response is OFF-TOPIC

Be fair but STRICT - your reputation as an examiner depends on accuracy.`,

            ielts_part1: `You are a certified IELTS Speaking Part 1 examiner with strict assessment standards.

PART 1 REQUIREMENTS:
- Familiar topics: work, home, family, hobbies
- Expected length: 4-5 minutes total (short answers per question)
- Must be ON-TOPIC or score 0.0

STRICT ASSESSMENT:
- Fluency and coherence (hesitations, self-correction, logical flow)
- Lexical resource (vocabulary range, less common items, collocations)
- Grammatical range and accuracy (complex structures, error frequency)
- Pronunciation (individual sounds, stress, intonation, intelligibility)

Apply authentic IELTS band descriptors. Most candidates score 5.0-6.5 in Part 1.`,

            ielts_part2: `You are a certified IELTS Speaking Part 2 examiner.

PART 2 REQUIREMENTS:
- Speak continuously for 1-2 minutes on cue card topic
- Must cover ALL bullet points on cue card
- Must be ON-TOPIC or score 0.0

STRICT SCORING:
- Short responses (under 1 minute): MAX score 5.0
- Missing bullet points: -1.0 per missing point
- Off-topic: 0.0 for ALL criteria
- Assess: task achievement, coherence, vocabulary, grammar, pronunciation

Band 7.0+ requires: sustained discourse, flexible grammar, wide vocabulary, clear pronunciation.`,

            ielts_part3: `You are a certified IELTS Speaking Part 3 examiner with strict standards.

PART 3 REQUIREMENTS:
- Abstract discussion and in-depth opinions
- Must relate to Part 2 topic or given discussion points
- Off-topic responses score 0.0

STRICT ASSESSMENT:
- Abstract thinking and opinion justification required
- Complex grammatical structures expected (conditionals, passives, relative clauses)
- Advanced vocabulary and idiomatic expressions
- Critical analysis and examples

Band 7.0+ requires sophisticated language, nuanced opinions, minimal errors. Most score 5.5-7.0.`,

            pronunciation: `You are a pronunciation specialist and IELTS examiner.

FOCUS AREAS:
- Individual phoneme accuracy (vowels, consonants)
- Word stress patterns (syllable emphasis)
- Sentence intonation (rising/falling patterns)
- Connected speech (linking, weak forms, elision)

STRICT CRITERIA:
- Each mispronounced word: note incorrect vs correct with IPA
- Assess intelligibility: Can native speakers understand easily?
- Identify L1 (first language) interference patterns
- Provide specific correction techniques

Most non-native speakers: 5.0-6.5 for pronunciation. Band 7.0+ requires near-native clarity.`,

            grammar: `You are a grammar expert and IELTS examiner.

STRICT ASSESSMENT:
- Identify EVERY grammatical error
- Classify: tense, agreement, articles, prepositions, word order, etc.
- Assess range: simple vs complex structures
- Assess accuracy: error frequency and severity

SCORING:
- Band 6.0: Mostly simple structures, some complex with errors
- Band 7.0: Complex structures with good control, some errors
- Band 8.0: Wide range of structures with rare errors

Provide detailed explanations and authentic examples for each error.`
        };

        return prompts[mode] || prompts.conversation;
    }

    /**
     * Conversation prompts for teacher responses
     */
    getConversationPrompt(mode) {
        return `You are a friendly but professional English teacher. Your role:

1. Have natural conversations to help students practice
2. Ask follow-up questions to encourage more speaking
3. Use varied vocabulary appropriate for the student's level
4. Gently correct errors in your responses (e.g., "Do you mean [correct word]?")
5. Keep responses SHORT (2-3 sentences) so students can practice more

Be encouraging and supportive. Your goal is to make students comfortable speaking English.`;
    }

    /**
     * Get random practice topic
     */
    async getRandomTopic(difficulty = 'intermediate') {
        // Import db here to avoid circular dependency
        const { default: db } = await import('../config/database.js');
        const [topics] = await db.query(
            'SELECT * FROM speaking_practice_topics WHERE difficulty_level = ? AND is_active = TRUE ORDER BY RAND() LIMIT 1',
            [difficulty]
        );
        return topics[0] || null;
    }

    /**
     * Generate sample answer for a topic with key vocabulary
     */
    async generateSampleAnswer(topic, question) {
        try {
            const prompt = `You are an IELTS examiner creating a Band 7.0 sample answer.

Topic: ${topic}
Question: ${question}

Generate a natural, fluent IELTS Band 7.0 sample answer (3-4 sentences) that demonstrates:
- Clear pronunciation patterns (easy to read aloud)
- Good range of vocabulary (Band 6.5-7.0 speaking in ${topic})
- Complex sentence structures with accuracy
- Natural discourse markers (well, actually, to be honest, etc.)
- Personal examples or specific details
- Natural pauses indicated by commas

IELTS Band 7.0 characteristics:
✓ Speaks at length with minimal hesitation
✓ Uses a range of connectives and discourse markers
✓ Shows flexible use of complex structures
✓ Uses a wide vocabulary resource with some flexibility
✓ Produces extended responses with coherent ideas

Return ONLY the sample answer text. Do NOT add explanations or notes.`;

            const completion = await this.groqClient.chat.completions.create({
                messages: [
                    { role: 'system', content: 'You are an expert IELTS speaking examiner who creates Band 7.0 level sample answers.' },
                    { role: 'user', content: prompt }
                ],
                model: 'llama-3.3-70b-versatile',
                temperature: 0.7,
                max_tokens: 200
            });

            const sampleText = completion.choices[0].message.content.trim();

            // Extract key vocabulary from the sample answer
            const vocabPrompt = `Extract 8-12 key vocabulary words/phrases from this IELTS speaking sample related to the topic "${topic}".

Sample text: "${sampleText}"

For each word/phrase, provide:
- The exact word/phrase from the text (nouns, verbs, adjectives, collocations)
- IPA pronunciation
- CEFR level (A1, A2, B1, B2, C1, C2)

Return ONLY a JSON array in this format:
[{"word": "technology", "ipa": "/tekˈnɒlədʒi/", "level": "B1"}, ...]

Focus on topic-specific vocabulary that learners should know. NO explanations.`;

            const vocabCompletion = await this.groqClient.chat.completions.create({
                messages: [
                    { role: 'system', content: 'You are a vocabulary extraction expert. Return only valid JSON arrays.' },
                    { role: 'user', content: vocabPrompt }
                ],
                model: 'llama-3.3-70b-versatile',
                temperature: 0.3,
                max_tokens: 500
            });

            let vocabulary = [];
            try {
                const vocabText = vocabCompletion.choices[0].message.content.trim();
                // Extract JSON array even if wrapped in markdown code blocks
                const jsonMatch = vocabText.match(/\[\s*\{[\s\S]*\}\s*\]/);
                if (jsonMatch) {
                    vocabulary = JSON.parse(jsonMatch[0]);
                }
            } catch (parseError) {
                console.error('Vocabulary parsing error:', parseError);
                vocabulary = [];
            }

            return {
                sample_answer: sampleText,
                vocabulary: vocabulary
            };
        } catch (error) {
            console.error('Sample answer generation error:', error);
            return null;
        }
    }
}

export default new SpeakingPracticeService();
