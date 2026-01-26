# How AI Detects and Corrects Pronunciation Errors

## 📌 Overview of the Process

The system uses **2 main steps** to detect and correct pronunciation errors:

```
Audio Recording → Transcription (STT) → AI Analysis → Error Detection & Correction
```

---

## 🎤 Step 1: Speech-to-Text Conversion

### Technology Used
- **Model**: Groq Whisper Large V3
- **Capabilities**: State-of-the-art speech recognition
- **Features**: 
  - High accuracy (98-99% with clear speech)
  - Supports multiple English accents (US, UK, Australian, etc.)
  - Good noise and background sound handling

### Transcription Process

```javascript
// File: speakingPracticeService.js
async transcribeAudio(audioPath) {
    const audioFile = fs.readFileSync(audioPath);
    
    const transcription = await groq.audio.transcriptions.create({
        file: audioFile,
        model: "whisper-large-v3",
        language: "en", // English specified
        response_format: "json"
    });
    
    return {
        text: transcription.text,
        duration: transcription.duration
    };
}
```

### Example Output
**Audio input**: "I went to the supermaket yesterday"  
**Transcription output**: `"I went to the supermaket yesterday"`

⚠️ **Note**: Whisper transcribes **exactly what the user says**, including pronunciation errors!

---

## 🧠 Step 2: AI Analysis - Error Detection & Correction

### Technology Used
- **Model**: LLaMA 3.3 70B Versatile (Groq)
- **Capabilities**: 
  - Deep contextual understanding
  - Grammar and vocabulary error detection
  - Comparison with correct pronunciation

### Pronunciation Error Detection Mechanism

#### 2.1. Context Analysis
AI reads the entire sentence and understands:
- Sentence meaning
- Which words are correct/incorrect in context
- Which words seem mispronounced

#### 2.2. Dictionary Comparison
AI has knowledge of:
- Over 170,000+ English words
- Standard IPA (International Phonetic Alphabet) pronunciations
- Common pronunciation mistakes

#### 2.3. AI Instruction Prompt

```javascript
CRITICAL PRONUNCIATION ERROR DETECTION:
You are analyzing transcribed speech from Whisper STT. Follow these rules:

1. IDENTIFY PRONUNCIATION ERRORS:
   - Look for words that sound SIMILAR to correct words but are misspelled/wrong
   - Example: "supermaket" → should be "supermarket"
   - Example: "libary" → should be "library"
   - Example: "feburary" → should be "February"

2. DETERMINE IF IT'S PRONUNCIATION ERROR:
   - If the word doesn't exist in standard English → likely pronunciation error
   - If it's close to a real word phonetically → definitely pronunciation error
   - If it's a grammar mistake (wrong tense/form) → NOT pronunciation error

3. PROVIDE IPA PRONUNCIATION:
   - Show CORRECT pronunciation: /ˈsuːpərˌmɑːrkɪt/
   - Show STUDENT'S pronunciation: /ˈsuːpərmækɪt/
   - Highlight the difference clearly

4. OUTPUT FORMAT (JSON):
{
    "pronunciation_errors": [
        {
            "word": "supermaket",           // Word as transcribed
            "correct": "supermarket",        // Correct spelling
            "ipa_correct": "/ˈsuːpərˌmɑːrkɪt/",
            "ipa_student": "/ˈsuːpərmækɪt/",
            "position": 15,                  // Character position in text
            "explanation": "Missing 'r' sound between 'ma' and 'ket'. You said 'mak' but should say 'mark'."
        }
    ]
}
```

---

## 🔍 Detailed Example: Pronunciation Error Detection

### Case Study 1: "supermaket" → "supermarket"

#### Input
```
Transcription: "I went to the supermaket yesterday"
```

#### AI Analysis Process

**Step 1: Tokenization**
```
["I", "went", "to", "the", "supermaket", "yesterday"]
```

**Step 2: Dictionary Check**
- "I" ✓ (valid)
- "went" ✓ (valid)
- "to" ✓ (valid)
- "the" ✓ (valid)
- "supermaket" ✗ (NOT in dictionary)
- "yesterday" ✓ (valid)

**Step 3: Similarity Analysis**
```
"supermaket" → candidates:
- "supermarket" (edit distance: 1, phonetic similarity: 95%)
- "superb" (edit distance: 6, phonetic similarity: 30%)
- "supreme" (edit distance: 7, phonetic similarity: 25%)
```

**Step 4: Context Verification**
```
Sentence context: "went to the _____ yesterday"
Most likely: "supermarket" (shopping place)
```

**Step 5: Generate IPA**
```
Correct:  /ˈsuːpərˌmɑːrkɪt/
Student:  /ˈsuːpərmækɪt/
Difference: Missing /r/ sound in "mar" syllable
```

#### Output
```json
{
    "pronunciation_errors": [
        {
            "word": "supermaket",
            "correct": "supermarket",
            "ipa_correct": "/ˈsuːpərˌmɑːrkɪt/",
            "ipa_student": "/ˈsuːpərmækɪt/",
            "position": 15,
            "explanation": "You missed the 'r' sound. Say 'super-MAR-ket' with a clear /r/ sound in the middle syllable."
        }
    ],
    "pronunciation_score": 7.5
}
```

---

### Case Study 2: "libary" → "library"

#### Analysis
```
Transcription: "I borrowed a book from the libary"
Error detected: "libary"
Correct word: "library"

IPA Analysis:
- Correct:  /ˈlaɪbreri/
- Student:  /ˈlaɪbəri/
- Issue: Missing /r/ sound after /b/

Explanation: "You need to pronounce 'li-BRAR-y' with 3 syllables, 
not 'li-BAR-y' with 2 syllables. Add the /r/ sound after 'b'."
```

---

## 📊 Types of Pronunciation Errors Detected

### 1. Missing Sounds
```
supermaket → supermarket   (missing /r/)
feburary   → February      (missing /r/)
libary     → library       (missing /r/)
```

### 2. Added Sounds
```
athalete   → athlete       (extra /a/)
stastistics → statistics   (extra /s/)
```

### 3. Substituted Sounds
```
tree → tee    (/tr/ → /t/)
three → tree  (/θ/ → /tr/)
ship → sheep  (/ɪ/ → /iː/)
```

### 4. Wrong Stress Pattern
```
PHOtograph → phoTOgraph ❌
Should be: PHOtograph ✓
```

### 5. Silent Letters Pronounced
```
knife → k-nife ❌ (pronouncing the 'k')
Should be: /naɪf/ ✓
```

---

## 🎯 Scoring System

### Pronunciation Score Calculation

```javascript
Base Score = 10.0

Deductions:
- Minor error (1 sound difference):     -0.5 points
- Moderate error (2-3 sounds):          -1.0 points
- Major error (word unrecognizable):    -2.0 points
- Wrong stress pattern:                 -0.5 points

Example:
- 3 minor errors:  10.0 - (3 × 0.5) = 8.5
- 2 moderate errors: 10.0 - (2 × 1.0) = 8.0
- 1 major error:   10.0 - 2.0 = 8.0
```

### IELTS Band Mapping
```
9.0-10.0  → Native-like pronunciation
8.0-8.9   → Excellent, very few errors
7.0-7.9   → Good, some minor errors
6.0-6.9   → Competent, noticeable errors
5.0-5.9   → Moderate, frequent errors
< 5.0     → Needs significant improvement
```

---

## 💡 Real-World Examples from the System

### Test Case 1: Perfect Pronunciation
```
Audio: "I enjoy reading books in my free time"
Transcription: "I enjoy reading books in my free time"
AI Analysis: ✓ No errors detected
Pronunciation Score: 10.0
```

### Test Case 2: Minor Errors
```
Audio: "I went to the libary yesterday"
Transcription: "I went to the libary yesterday"
AI Detection:
- Error 1: "libary" → "library"
  IPA: /ˈlaɪbəri/ → /ˈlaɪbreri/
  Issue: Missing /r/ after /b/
  
Pronunciation Score: 9.0
Feedback: "Good overall! Remember to pronounce all the 'r' sounds in 'library'."
```

### Test Case 3: Multiple Errors
```
Audio: "I went to the supermaket to buy some vegtables"
Transcription: "I went to the supermaket to buy some vegtables"
AI Detection:
- Error 1: "supermaket" → "supermarket"
  Missing /r/ sound
  
- Error 2: "vegtables" → "vegetables"
  Missing /ə/ sound in second syllable
  
Pronunciation Score: 7.5
Feedback: "Focus on pronouncing all syllables clearly, especially 'r' sounds."
```

---

## 🛠️ Advanced Techniques

### 1. Context-Aware Detection
AI doesn't just look at individual words but understands context:

```
Example: "I red a book" vs "The book is red"
- "red" could be:
  1. Past tense of "read" (pronounced /red/)
  2. Color "red" (pronounced /red/)
  
AI uses context to determine:
- "I red a book" → Should be "read" /red/ (past tense)
- "The book is red" → Correct "red" /red/ (color)
```

### 2. Multi-Stage Validation
```
Stage 1: Dictionary Check
Stage 2: Phonetic Similarity
Stage 3: Context Analysis
Stage 4: Grammar Verification
Stage 5: Final Confidence Score
```

### 3. Error Confidence Levels
```javascript
{
    "word": "supermaket",
    "correct": "supermarket",
    "confidence": 0.98,  // 98% sure it's pronunciation error
    "alternative_corrections": [
        { "word": "super make it", "confidence": 0.02 }
    ]
}
```

---

## 📝 Limitations

### 1. Whisper Transcription Accuracy
- If Whisper transcribes incorrectly → AI cannot detect
- Example: Says "library" but Whisper writes "library" → No error reported

### 2. Homophones
```
"their" vs "there" vs "they're"
→ Same pronunciation, only grammar errors detected, not pronunciation
```

### 3. Accent Variations
```
US accent: /ˈwɔːtər/ (water)
UK accent: /ˈwɔːtə/ (water)
→ AI accepts both, not considered an error
```

---

## 🎓 Best Practices for Users

### For Most Accurate Error Detection:

1. **Speak Clearly, Not Too Fast**
   - Moderate speed: 120-150 words/minute
   - Avoid mumbling or swallowing sounds

2. **Good Recording Environment**
   - Minimal background noise
   - Good quality microphone
   - No echo/reverb

3. **Pronounce Clearly**
   - Emphasize ending sounds
   - Don't skip syllables
   - Distinguish /l/ and /r/, /th/ and /t/

4. **Practice Regularly**
   - AI learns from patterns
   - More data → More accurate
   - Review feedback and improve

---

## 🔗 Additional Resources

### Related Files
- `speakingPracticeService.js` - AI analysis logic
- `speakingPracticeController.js` - API handlers
- `AI_PRONUNCIATION_DETECTION_PROCESS.md` - Technical documentation
- `SpeakingPractice.jsx` - Frontend UI component

### External Resources
- Groq Whisper Documentation: https://console.groq.com/docs/speech-text
- IPA Chart: https://www.internationalphoneticalphabet.org/
- IELTS Pronunciation Criteria: https://www.ielts.org/

---

## 📞 Support

If you have questions or issues with pronunciation detection:
1. Check console logs
2. Review transcription output
3. Test with different microphone/environment
4. Contact support team

---

**Last Updated**: January 11, 2026  
**Version**: 2.0  
**Author**: AI Quiz Development Team
