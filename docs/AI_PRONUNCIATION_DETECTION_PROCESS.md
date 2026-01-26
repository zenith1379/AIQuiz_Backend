# AI Speaking Practice - Pronunciation Error Detection Process

> **📚 User-Friendly Guides:**
> - [🇬🇧 How AI Detects Pronunciation Errors (English)](./HOW_AI_DETECTS_PRONUNCIATION_ERRORS_EN.md)
> - [🇻🇳 Cách AI Phát Hiện Lỗi Phát Âm (Tiếng Việt)](./HOW_AI_DETECTS_PRONUNCIATION_ERRORS_VI.md)

---

## Overview
This document explains the complete workflow of how the AI Speaking Practice system detects pronunciation errors, analyzes speech quality, and provides detailed feedback to learners.

---

## 🎯 System Architecture

### 1. Audio Recording & Storage
```
User speaks → Browser records (WebM) → Frontend sends to backend → Audio saved to disk
```

**Storage Location:** `BE_quiz/backend/uploads/speaking/`

**File Format:** `.webm` (browser MediaRecorder API)

**Database Record:**
- `audioUrl`: Path to stored audio file (e.g., `/uploads/speaking/1234567890-audio.webm`)
- `transcription`: Full text of what the user said
- `durationSeconds`: Length of the recording

---

## 🔊 Audio Processing Pipeline

### Step 1: Audio Upload
```javascript
// Frontend (SpeakingPractice.jsx)
const formData = new FormData();
formData.append('audio', audioBlob, 'recording.webm');
formData.append('practiceMode', practiceMode);
formData.append('topic', selectedTopic.title);
formData.append('question', currentQuestion);

// Send to backend
await axios.post(`${API_URL}/api/speaking-practice/submit`, formData);
```

### Step 2: Speech-to-Text (Transcription)
**Service:** `speakingPracticeService.transcribeAudio()`

**Technology:** Groq Whisper-large-v3 (or compatible STT model)

**Process:**
1. Audio file is read from disk
2. File buffer sent to Groq's transcription API
3. API returns:
   - `text`: Full transcription of the speech
   - `duration`: Audio length in seconds
   - `language`: Detected language (en, vi, etc.)

**Code:**
```javascript
const transcription = await speakingPracticeService.transcribeAudio(audioPath);
// Returns: { text: "...", duration: 45, language: "en" }
```

---

## 🧠 AI Analysis Engine

### Step 3: Comprehensive Speech Analysis
**Service:** `speakingPracticeService.analyzeSpoken()`

**AI Model:** Groq LLaMA 3.3 70B (or equivalent LLM)

**Input Data:**
- User's transcribed speech text
- Practice mode (IELTS Part 1/2/3, conversation, etc.)
- Topic/question context
- Environmental context (time, location, weather if available)

**AI Prompt System:**
The system uses a strict IELTS examiner persona with comprehensive analysis criteria:

```javascript
{
  role: "system",
  content: `You are a strict IELTS Speaking examiner. 
  
  Your task:
  1. Check if response is ON-TOPIC
  2. If OFF-TOPIC → Set all scores to 0.0
  3. If ON-TOPIC → Grade using authentic IELTS band descriptors (0-9 scale)
  
  Analysis must include:
  - Pronunciation errors with IPA phonetics
  - Grammar mistakes with explanations
  - Vocabulary usage analysis (A1-C2 levels)
  - Fluency patterns
  - Coherence and cohesion
  - Skill-specific weaknesses
  - Scoring justifications for each criterion`
}
```

### Step 4: Pronunciation Error Detection

**How AI Detects Pronunciation Errors:**

#### Method 1: Contextual Analysis
The AI compares the transcribed text against expected pronunciations for common words. For example:
- User says: "I think the **wether** is nice"
- AI knows: "weather" is the correct word in this context
- Detects mismatch: transcription shows phonetic spelling indicates mispronunciation

#### Method 2: Common Error Patterns
AI is trained on common pronunciation mistakes:
```json
{
  "word": "schedule",
  "incorrect": "skedule",
  "correct": "shedule", 
  "ipa": "/ˈʃedjuːl/",
  "tip": "British English pronounces the 'sch' as 'sh' not 'sk'"
}
```

#### Method 3: IPA Phonetic Mapping
For each detected error:
1. AI identifies the mispronounced word
2. Looks up correct IPA notation
3. Generates correction tip based on phonetic rules
4. Classifies difficulty level (Basic/Intermediate/Advanced)

**Example Output:**
```json
{
  "pronunciationErrors": [
    {
      "word": "environment",
      "incorrect": "enviroment",
      "correct": "environment",
      "ipa": "/ɪnˈvaɪrənmənt/",
      "difficulty": "Intermediate",
      "tip": "Don't skip the 'n' in the middle. Practice: en-VI-ron-ment"
    }
  ]
}
```

---

## 📊 Scoring System (IELTS Scale)

### Scoring Criteria (0-9 bands):

**1. Pronunciation (0-9)**
- Clarity of individual sounds
- Word stress patterns
- Sentence intonation
- Rhythm and connected speech

**2. Grammar (0-9)**
- Range of structures used
- Accuracy of tenses
- Complex sentence formation
- Error frequency and impact

**3. Fluency (0-9)**
- Speech rate
- Hesitations and pauses
- Repetitions and self-corrections
- Natural flow

**4. Vocabulary (0-9)**
- Range (Basic/Intermediate/Advanced words)
- Appropriacy for topic
- Collocation accuracy
- Idiomatic expressions

**5. Overall Score**
- Weighted average of all criteria
- Coherence and task achievement
- Off-topic responses receive 0.0

---

## 💾 Database Storage

### When User Clicks "Analyze Speech":
Full analysis with scores is saved:

```javascript
await SpeakingPracticeSession.create({
  userId,
  audioUrl: '/uploads/speaking/12345-audio.webm',
  transcription: 'I think technology is...',
  pronunciationScore: 6.5,
  grammarScore: 7.0,
  fluencyScore: 6.0,
  vocabularyScore: 7.5,
  overallScore: 6.75,
  pronunciationErrors: [...], // Array of error objects
  grammarErrors: [...],
  vocabularyAnalysis: {...},
  skillWeaknesses: [...],
  practiceMode: 'ielts_part2',
  topic: 'Technology in Education',
  durationSeconds: 120
});
```

### When User Clicks "Save" (Without Analysis):
Only transcription is saved (no scores):

```javascript
await SpeakingPracticeSession.create({
  userId,
  audioUrl: '/uploads/speaking/67890-audio.webm',
  transcription: 'Quick practice recording...',
  pronunciationScore: null,  // No analysis
  grammarScore: null,
  // ... all scores null
  aiResponseText: 'Recording saved for future review',
  practiceMode: 'conversation',
  topic: 'Saved practice',
  durationSeconds: 30
});
```

**Key Difference:**
- **Analyze:** Consumes AI API credits, provides full feedback
- **Save:** Just stores audio + transcription for history/review later

---

## 📜 History Display

### Frontend Query:
```javascript
const response = await axios.get(
  `${API_URL}/api/speaking-practice/history`,
  { headers: { Authorization: `Bearer ${token}` }}
);
```

### Backend Response:
```json
{
  "success": true,
  "sessions": [
    {
      "id": 123,
      "practiceMode": "ielts_part2",
      "topic": "Technology in Education",
      "pronunciation_score": 6.5,
      "grammar_score": 7.0,
      "fluency_score": 6.0,
      "vocabulary_score": 7.5,
      "overall_score": 6.75,
      "created_at": "2026-01-11T10:30:00Z",
      "durationSeconds": 120
    },
    {
      "id": 124,
      "practiceMode": "conversation",
      "topic": "Saved practice",
      "pronunciation_score": null,  // Saved without analysis
      "grammar_score": null,
      "created_at": "2026-01-11T11:00:00Z",
      "durationSeconds": 30
    }
  ]
}
```

**Display Logic:**
- Sessions with scores → Show full score badges
- Sessions without scores → Show "Saved for review" or "No scores"
- All sessions include playback link to original audio file

---

## 🎨 Frontend Visualization

### Sample Answer Highlighting
When user clicks "Show Hint", the AI-generated sample answer displays with:

**1. Topic Vocabulary (Purple Text)**
```html
<span class="vocab-word" data-ipa="/ɪnˈvaɪrənmənt/" data-level="B1">
  environment
  <span class="vocab-info">
    <span class="vocab-level">B1</span>
    <span class="vocab-ipa">/ɪnˈvaɪrənmənt/</span>
  </span>
</span>
```
- **Hover** → Shows IPA in purple + CEFR level

**2. Linking Words (Red Text)**
```html
<span class="discourse-marker">moreover</span>
```

**3. Grammar Patterns (Red Underline)**
```html
<span class="grammar-highlight">not only...but also</span>
```

### Pronunciation Error Display
```jsx
<p>
  You said: "enviroment"
  <button onClick={() => speakText("enviroment")}>🔊</button>
  → Correct: "environment"
</p>
<p className="ipa">IPA: /ɪnˈvaɪrənmənt/</p>
```

**Behavior:**
- Click 🔊 → Browser TTS reads the **incorrect** pronunciation (what student said)
- Helps student hear their mistake
- IPA shows correct pronunciation for reference

---

## 🔄 Complete User Flow

### Full Analysis Flow:
```
1. User records speech (30-120 seconds)
2. Frontend sends audio to backend
3. Backend transcribes audio (Whisper API)
4. Backend analyzes with AI (LLaMA 3.3)
5. AI detects:
   - Pronunciation errors (with IPA)
   - Grammar mistakes
   - Vocabulary level
   - Fluency issues
6. Backend calculates IELTS scores (0-9)
7. Backend saves to database
8. Frontend displays:
   - Score badges
   - Error lists with playback
   - Suggestions
9. Session appears in History
```

### Quick Save Flow:
```
1. User records speech (any length)
2. Frontend sends audio to backend
3. Backend transcribes audio only
4. Backend saves transcription + audio URL
5. Frontend shows "Saved successfully"
6. Session appears in History (no scores)
7. User can review/listen later
```

---

## 🧪 Testing & Validation

### How to Test Pronunciation Detection:
1. Record speech with intentional errors:
   - "The *wether* is nice" (weather)
   - "I want to *ax* you" (ask)
   - "Let me *arks* a question" (ask)

2. Submit for analysis

3. Check output includes:
   - Detected incorrect word
   - Correct word
   - IPA phonetics
   - Helpful tip

### Expected AI Response Format:
```json
{
  "off_topic": false,
  "scores": {
    "pronunciation": 5.5,
    "grammar": 6.0,
    "fluency": 5.0,
    "vocabulary": 6.5,
    "overall": 5.75
  },
  "pronunciationErrors": [
    {
      "word": "ask",
      "incorrect": "arks",
      "correct": "ask",
      "ipa": "/æsk/",
      "difficulty": "Basic",
      "tip": "The 's' comes before the 'k'. Practice: a-s-k (not a-k-s)"
    }
  ],
  "scoring_justification": {
    "pronunciation": "Band 5.5: Some mispronunciations affect clarity...",
    "grammar": "Band 6.0: Mix of simple and complex structures...",
    ...
  }
}
```

---

## 🔐 Security & Performance

### Audio File Storage:
- Files stored in: `backend/uploads/speaking/`
- Naming: `{timestamp}-{randomId}.webm`
- Access: Authenticated users only (JWT required)

### API Rate Limiting:
- Transcription: ~5-10 seconds per minute of audio
- Analysis: ~3-5 seconds per response
- Recommended: Max 1 analysis per 10 seconds per user

### Data Retention:
- Audio files: Retained indefinitely (or set cleanup policy)
- Database records: Permanent (for progress tracking)
- Suggestion: Implement cleanup after 90 days for storage management

---

## 📚 Key Technologies

| Component | Technology | Purpose |
|-----------|-----------|---------|
| Speech-to-Text | Groq Whisper-large-v3 | Transcribe audio to text |
| AI Analysis | Groq LLaMA 3.3 70B | Detect errors, score speech |
| Text-to-Speech | Browser Web Speech API | Play back corrections |
| Audio Storage | Node.js File System | Store .webm files |
| Database | PostgreSQL + Sequelize | Persist sessions & scores |
| Frontend | React + Axios | User interface & API calls |

---

## 🎓 Educational Value

### What Students Learn:
1. **Pronunciation Awareness**: See/hear their mistakes with IPA guidance
2. **Grammar Patterns**: Highlighted structures in sample answers
3. **Vocabulary Building**: Topic-specific words with CEFR levels
4. **IELTS Preparation**: Authentic band score feedback
5. **Progress Tracking**: Historical scores and improvement trends

### Teacher/AI Feedback Loop:
- Immediate, objective scoring
- Specific, actionable corrections
- Consistent IELTS standards
- Available 24/7 for practice

---

## 🔧 Troubleshooting

### Common Issues:

**1. "Pronunciation errors not detected"**
- Check: Is transcription accurate?
- Reason: If STT perfectly transcribes (no errors), AI may not detect issues
- Solution: Use longer, more complex responses

**2. "All scores are 0.0"**
- Check: Is response on-topic?
- Reason: Off-topic filter triggers 0.0 scores
- Solution: Ensure answer matches the question

**3. "Audio file not in history"**
- Check: Did `loadHistory()` get called after save?
- Fix: Frontend already calls `loadHistory()` after successful save
- Verify: Check Network tab for `/api/speaking-practice/history` call

**4. "Speaker button doesn't play incorrect word"**
- Check: Button now calls `speakText(error.incorrect)`
- Verify: Should play student's mispronunciation, not IPA
- Browser: Ensure Web Speech API is supported

---

## 🚀 Future Enhancements

### Planned Features:
1. **Phoneme-Level Analysis**: More granular pronunciation detection
2. **Real-Time Feedback**: Live pronunciation hints during recording
3. **Voice Cloning**: Generate teacher responses in multiple accents
4. **Video Support**: Add visual cues for mouth positioning
5. **Gamification**: XP, badges, streaks for consistent practice
6. **Peer Comparison**: Anonymous benchmarking against other learners

---

## 📞 Support

For technical issues or questions about the AI pronunciation detection system:
- Backend logs: `backend/logs/app.log`
- Frontend console: Browser DevTools
- Database queries: Check Sequelize logs

---

**Document Version:** 1.0  
**Last Updated:** January 11, 2026  
**Maintained By:** AI Speaking Practice Development Team
