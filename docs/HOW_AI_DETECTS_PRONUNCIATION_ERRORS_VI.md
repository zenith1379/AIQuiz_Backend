# Cách AI Phát Hiện và Sửa Lỗi Phát Âm

## 📌 Tổng Quan Quy Trình

Hệ thống sử dụng **2 bước chính** để phát hiện và sửa lỗi phát âm:

```
Audio Recording → Transcription (STT) → AI Analysis → Error Detection & Correction
```

---

## 🎤 Bước 1: Chuyển Đổi Giọng Nói Thành Text (Speech-to-Text)

### Công Nghệ Sử Dụng
- **Model**: Groq Whisper Large V3
- **Khả năng**: State-of-the-art speech recognition
- **Đặc điểm**: 
  - Nhận diện từ chính xác cao (98-99% với giọng rõ ràng)
  - Hỗ trợ nhiều giọng English (US, UK, Australian, etc.)
  - Xử lý noise và background sound tốt

### Quy Trình Transcription

```javascript
// File: speakingPracticeService.js
async transcribeAudio(audioPath) {
    const audioFile = fs.readFileSync(audioPath);
    
    const transcription = await groq.audio.transcriptions.create({
        file: audioFile,
        model: "whisper-large-v3",
        language: "en", // Chỉ định tiếng Anh
        response_format: "json"
    });
    
    return {
        text: transcription.text,
        duration: transcription.duration
    };
}
```

### Output Ví Dụ
**Audio input**: "I went to the supermaket yesterday"  
**Transcription output**: `"I went to the supermaket yesterday"`

⚠️ **Lưu ý**: Whisper transcribe **chính xác những gì người dùng nói**, kể cả lỗi phát âm!

---

## 🧠 Bước 2: AI Analysis - Phát Hiện và Sửa Lỗi

### Công Nghệ Sử Dụng
- **Model**: LLaMA 3.3 70B Versatile (Groq)
- **Khả năng**: 
  - Hiểu ngữ cảnh sâu
  - Phát hiện lỗi ngữ pháp và từ vựng
  - So sánh với cách nói đúng

### Cơ Chế Phát Hiện Lỗi Phát Âm

#### 2.1. Phân Tích Ngữ Cảnh
AI đọc toàn bộ câu và hiểu:
- Ý nghĩa câu nói
- Từ nào đúng/sai trong ngữ cảnh
- Từ nào có vẻ bị phát âm sai

#### 2.2. So Sánh Với Từ Điển
AI có kiến thức về:
- Hơn 170,000+ từ tiếng Anh
- Phát âm chuẩn IPA (International Phonetic Alphabet)
- Các lỗi phát âm phổ biến

#### 2.3. Prompt Hướng Dẫn AI

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

## 🔍 Ví Dụ Chi Tiết: Phát Hiện Lỗi Phát Âm

### Case Study 1: "supermaket" → "supermarket"

#### Input
```
Transcription: "I went to the supermaket yesterday"
```

#### AI Analysis Process

**Bước 1: Tokenization**
```
["I", "went", "to", "the", "supermaket", "yesterday"]
```

**Bước 2: Dictionary Check**
- "I" ✓ (valid)
- "went" ✓ (valid)
- "to" ✓ (valid)
- "the" ✓ (valid)
- "supermaket" ✗ (NOT in dictionary)
- "yesterday" ✓ (valid)

**Bước 3: Similarity Analysis**
```
"supermaket" → candidates:
- "supermarket" (edit distance: 1, phonetic similarity: 95%)
- "superb" (edit distance: 6, phonetic similarity: 30%)
- "supreme" (edit distance: 7, phonetic similarity: 25%)
```

**Bước 4: Context Verification**
```
Sentence context: "went to the _____ yesterday"
Most likely: "supermarket" (shopping place)
```

**Bước 5: Generate IPA**
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

## 📊 Các Loại Lỗi Phát Âm Phát Hiện Được

### 1. Missing Sounds (Âm Bị Thiếu)
```
supermaket → supermarket   (missing /r/)
feburary   → February      (missing /r/)
libary     → library       (missing /r/)
```

### 2. Added Sounds (Âm Thừa)
```
athalete   → athlete       (extra /a/)
stastistics → statistics   (extra /s/)
```

### 3. Substituted Sounds (Âm Bị Thay Thế)
```
tree → tee    (/tr/ → /t/)
three → tree  (/θ/ → /tr/)
ship → sheep  (/ɪ/ → /iː/)
```

### 4. Wrong Stress Pattern (Nhấn Sai)
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

## 🎯 Scoring System - Đánh Giá Phát Âm

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

## 💡 Ví Dụ Thực Tế Từ Hệ Thống

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

## 🛠️ Kỹ Thuật Nâng Cao

### 1. Context-Aware Detection
AI không chỉ xem từng từ riêng lẻ mà còn hiểu ngữ cảnh:

```
Example: "I red a book" vs "The book is red"
- "red" có thể là:
  1. Past tense của "read" (phát âm /red/)
  2. Màu "red" (phát âm /red/)
  
AI dùng context để biết:
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

## 📝 Limitations (Hạn Chế)

### 1. Whisper Transcription Accuracy
- Nếu Whisper transcribe SAI hoàn toàn → AI không phát hiện được
- Ví dụ: Nói "library" nhưng Whisper ghi "library" → Không có lỗi được báo cáo

### 2. Homophones (Từ Đồng Âm)
```
"their" vs "there" vs "they're"
→ Phát âm giống nhau, chỉ phát hiện được lỗi grammar, không phải pronunciation
```

### 3. Accent Variations
```
US accent: /ˈwɔːtər/ (water)
UK accent: /ˈwɔːtə/ (water)
→ AI accept cả hai, không coi là lỗi
```

---

## 🎓 Best Practices Cho Người Dùng

### Để Được Phát Hiện Lỗi Chính Xác Nhất:

1. **Nói rõ ràng, không quá nhanh**
   - Tốc độ vừa phải: 120-150 words/minute
   - Tránh nói nhòe, nuốt âm

2. **Môi trường ghi âm tốt**
   - Ít background noise
   - Microphone chất lượng tốt
   - Không có echo/reverb

3. **Phát âm đủ rõ**
   - Nhấn mạnh các âm cuối
   - Không bỏ qua syllable
   - Phân biệt /l/ và /r/, /th/ và /t/

4. **Thực hành nhiều**
   - AI học từ patterns
   - Càng nhiều data → càng chính xác
   - Review feedback và cải thiện

---

## 🔗 Tham Khảo Thêm

### Files Liên Quan
- `speakingPracticeService.js` - AI analysis logic
- `speakingPracticeController.js` - API handlers
- `AI_PRONUNCIATION_DETECTION_PROCESS.md` - Technical documentation
- `SpeakingPractice.jsx` - Frontend UI component

### External Resources
- Groq Whisper Documentation: https://console.groq.com/docs/speech-text
- IPA Chart: https://www.internationalphoneticalphabet.org/
- IELTS Pronunciation Criteria: https://www.ielts.org/

---

## 📞 Hỗ Trợ

Nếu có câu hỏi hoặc gặp vấn đề với pronunciation detection:
1. Kiểm tra console logs
2. Review transcription output
3. Test với different microphone/environment
4. Contact support team

---

**Last Updated**: January 11, 2026  
**Version**: 2.0  
**Author**: AI Quiz Development Team
