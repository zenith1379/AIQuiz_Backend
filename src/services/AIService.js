import axios from 'axios';
import config from '../config/config.js';

export class AIService {
  // Generate quiz content with AI
  static async generateQuiz(title, questionCount = 5, difficulty = 'medium', questionType = 'general', grade = null, description = null, pdfContext = null) {
    // Build difficulty description
    const difficultyDescriptions = {
      easy: 'basic level suitable for beginners. Use simple concepts and straightforward questions.',
      medium: 'intermediate level with moderate complexity. Mix fundamental and applied knowledge.',
      hard: 'advanced level requiring deep understanding. Include complex scenarios and critical thinking.'
    };

    // Build question type instructions
    const questionTypeInstructions = {
      general: `Generate a mix of different question formats following this distribution:
      
      TYPE 1 - SINGLE CHOICE (50% of questions):
      {
        "text": "Your question?",
        "type": "single",
        "timeLimit": 30,
        "hint": "A short clue to help the learner answer (no spoilers)",
        "options": [
          {"text": "Option A", "isCorrect": false},
          {"text": "Option B", "isCorrect": true},
          {"text": "Option C", "isCorrect": false},
          {"text": "Option D", "isCorrect": false}
        ]
      }
      Rules: Exactly 1 correct answer.
      
      TYPE 2 - MULTIPLE CHOICE (20% of questions):
      {
        "text": "Which statements about ${title} are TRUE? (Select all that apply)",
        "type": "multiple",
        "timeLimit": 45,
        "hint": "A short clue to help the learner select the correct statements",
        "options": [
          {"text": "Statement 1", "isCorrect": true},
          {"text": "Statement 2", "isCorrect": true},
          {"text": "Statement 3", "isCorrect": false},
          {"text": "Statement 4", "isCorrect": false}
        ]
      }
      Rules: 2-3 correct answers. Include "(Select all that apply)" in text.
      
      TYPE 3 - FILL IN BLANK (15% of questions):
      {
        "text": "${title} uses _____ for [concept].",
        "type": "fillblank",
        "timeLimit": 30,
        "hint": "A short clue about what belongs in the blank",
        "options": [
          {"text": "correct answer", "isCorrect": true},
          {"text": "distractor 1", "isCorrect": false},
          {"text": "distractor 2", "isCorrect": false},
          {"text": "distractor 3", "isCorrect": false}
        ]
      }
      Rules: Must contain _____ in question text.
      
      TYPE 4 - MATCHING (15% of questions):
      {
        "text": "Match the ${title} concepts:",
        "type": "matching",
        "timeLimit": 45,
        "hint": "A short clue about how to match terms and definitions",
        "matchingPairs": [
          {"term": "term1", "definition": "definition1"},
          {"term": "term2", "definition": "definition2"},
          {"term": "term3", "definition": "definition3"},
          {"term": "term4", "definition": "definition4"}
        ]
      }
      Rules: Use matchingPairs array, not options.
      
      DISTRIBUTION REQUIREMENT (50/20/15/15):
      - For ${questionCount} questions, generate approximately:
        * ${Math.max(1, Math.round(questionCount * 0.5))} single choice questions
        * ${Math.max(1, Math.round(questionCount * 0.2))} multiple choice questions
        * ${Math.round(questionCount * 0.15)} fillblank questions  
        * ${Math.round(questionCount * 0.15)} matching questions
      - Adjust rounding to ensure total exactly = ${questionCount}
      - Mix question types throughout the quiz (don't group by type)
      - Vary difficulty and topics across all questions`,
    
      single: `Generate ONLY single choice questions. EVERY question must follow this EXACT format:
      {
        "text": "Your clear question here?",
        "type": "single",
        "timeLimit": 30,
        "hint": "A short clue to help the learner answer (no spoilers)",
        "options": [
          {"text": "First option", "isCorrect": false},
          {"text": "Second option", "isCorrect": true},
          {"text": "Third option", "isCorrect": false},
          {"text": "Fourth option", "isCorrect": false}
        ]
      }
      
      RULES:
      - ALWAYS use "type": "single"
      - Provide exactly 4 options
      - Only ONE option has "isCorrect": true
      - All others have "isCorrect": false
      - Make distractors plausible but incorrect`,
    
      multiple: `Generate ONLY multiple-answer questions. EVERY question must follow this EXACT format:
      {
        "text": "Which of the following statements about ${title} are TRUE? (Select all that apply)",
        "type": "multiple",
        "timeLimit": 45,
        "hint": "A short clue to help the learner select the correct statements",
        "options": [
          {"text": "Statement 1 (correct)", "isCorrect": true},
          {"text": "Statement 2 (correct)", "isCorrect": true},
          {"text": "Statement 3 (wrong)", "isCorrect": false},
          {"text": "Statement 4 (wrong)", "isCorrect": false}
        ]
      }
      
      CRITICAL RULES:
      - ALWAYS use "type": "multiple"
      - Provide exactly 4 options
      - Mark AT LEAST TWO options with "isCorrect": true
      - Can have 2 or 3 correct answers (never all 4, never just 1)
      - Include "(Select all that apply)" in question text
      - All correct answers must be factually accurate
      - Wrong answers should be plausible but clearly incorrect
      
      EXAMPLE:
      {
        "text": "Which statements about Python lists are true? (Select all that apply)",
        "type": "multiple",
        "timeLimit": 45,
        "options": [
          {"text": "They preserve insertion order", "isCorrect": true},
          {"text": "They are mutable", "isCorrect": true},
          {"text": "They cannot contain duplicate values", "isCorrect": false},
          {"text": "They are immutable like tuples", "isCorrect": false}
        ]
      }`,
    
      fillblank: `Generate ONLY fill-in-the-blank questions. EVERY question must follow this EXACT format:
      {
        "text": "The sentence with _____ indicating the blank.",
        "type": "fillblank",
        "timeLimit": 30,
        "hint": "A short clue about what belongs in the blank",
        "options": [
          {"text": "correct answer", "isCorrect": true},
          {"text": "distractor 1", "isCorrect": false},
          {"text": "distractor 2", "isCorrect": false},
          {"text": "distractor 3", "isCorrect": false}
        ]
      }
      
      CRITICAL RULES:
      - ALWAYS use "type": "fillblank"
      - Question text MUST contain _____ (five underscores)
      - Provide exactly 4 options
      - Only ONE option has "isCorrect": true
      - The correct answer must fit naturally in the blank
      - Distractors should be similar but incorrect
      
      EXAMPLE:
      {
        "text": "In ${title}, _____ is used to create a function.",
        "type": "fillblank",
        "timeLimit": 30,
        "options": [
          {"text": "def", "isCorrect": true},
          {"text": "function", "isCorrect": false},
          {"text": "func", "isCorrect": false},
          {"text": "define", "isCorrect": false}
        ]
      }`,
    
      matching: `Generate ONLY matching questions. EVERY question must follow this EXACT format:
      {
        "text": "Match the following ${title} terms with their definitions:",
        "type": "matching",
        "timeLimit": 45,
        "hint": "A short clue about how to match terms and definitions",
        "matchingPairs": [
          {"term": "Term1", "definition": "Definition1"},
          {"term": "Term2", "definition": "Definition2"},
          {"term": "Term3", "definition": "Definition3"},
          {"term": "Term4", "definition": "Definition4"}
        ]
      }
      
      CRITICAL RULES:
      - ALWAYS use "type": "matching"
      - Use "matchingPairs" array (NOT "options" or "choices")
      - Each pair MUST have "term" and "definition" fields
      - Provide at least 4 matching pairs (can do 5-6)
      - Terms should be concepts/items to match
      - Definitions should be clear descriptions/explanations
      - Make pairs related to the topic
      
      EXAMPLE:
      {
        "text": "Match these ${title} data structures with their properties:",
        "type": "matching",
        "timeLimit": 45,
        "matchingPairs": [
          {"term": "List", "definition": "Mutable, ordered sequence"},
          {"term": "Tuple", "definition": "Immutable, ordered sequence"},
          {"term": "Set", "definition": "Unordered, unique elements"},
          {"term": "Dictionary", "definition": "Key-value mapping"}
        ]
      }`
    };

    // Build grade level instruction
    const gradeInstruction = grade ? `\n🎓 GRADE LEVEL: ${grade}
- Tailor questions to be appropriate for ${grade} level
- Use vocabulary and concepts suitable for this educational level
- Adjust complexity to match expected knowledge at this stage\n` : '';

    // Build PDF context instruction
    const pdfInstruction = pdfContext ? `\n📄 SOURCE DOCUMENT:
You have been provided with extracted text from a PDF document: "${pdfContext.filename}"

DOCUMENT CONTENT:
${pdfContext.text.substring(0, 3000)}${pdfContext.text.length > 3000 ? '...\n[Document content truncated for brevity]' : ''}

IMPORTANT: Base your questions PRIMARILY on the content from this document. Use the document's specific examples, terminology, and concepts. Questions should test understanding of the material in this document.\n` : '';

    // Build description context instruction
    const descriptionInstruction = description ? `\nQUIZ DESCRIPTION:
The quiz creator provided this description: "${description}"

IMPORTANT: Use this description as additional context and focus for generating questions. Tailor the quiz content to match what the creator wants to emphasize.\n` : '';

    const prompt = `You are an expert quiz generator. Create a quiz about "${title}".
${pdfInstruction}${descriptionInstruction}
STRICT REQUIREMENTS:
- Number of questions: ${questionCount}
- Difficulty level: ${difficulty} (${difficultyDescriptions[difficulty]})
- Question format: ${questionType}${gradeInstruction}

CRITICAL: You MUST follow the format instructions below EXACTLY!

FORMAT INSTRUCTIONS FOR "${questionType.toUpperCase()}" TYPE:
${questionTypeInstructions[questionType]}

QUALITY GUIDELINES:
1. Questions should be clear, concise, and unambiguous
2. Cover different aspects of "${title}"
3. Use proper grammar and formatting
4. For ${difficulty} difficulty: ${difficultyDescriptions[difficulty]}
${questionType === 'fillblank' ? '5. Question text MUST contain _____ (five underscores) for the blank' : ''}
${questionType === 'matching' ? '5. Use "term → definition" format for matching pairs' : ''}

OUTPUT MUST BE VALID JSON:
Return ONLY a JSON object with this structure (no markdown, no extra text):

{
  "questions": [
    {
      "text": "Your question here?",
      "type": "${questionType === 'general' ? 'single|multiple|fillblank|matching (based on distribution)' : questionType}",
      "timeLimit": ${questionType === 'matching' ? 45 : questionType === 'multiple' ? 45 : 30},
      "fact": "An interesting fact related to this question that will be shown after answering. Make it educational and engaging!",
      "hint": "A short hint to help the learner answer (no spoilers)",
      ${questionType === 'matching' 
        ? '"matchingPairs": [{"term": "Term1", "definition": "Def1"}, {"term": "Term2", "definition": "Def2"}]'
        : '"options": [{"text": "Option A", "isCorrect": false}, {"text": "Option B", "isCorrect": true}, {"text": "Option C", "isCorrect": false}, {"text": "Option D", "isCorrect": false}]'
      }
    }
  ]
}

REMEMBER:
- Generate EXACTLY ${questionCount} questions
- EVERY question MUST have a "fact" field with an interesting, educational fact
- EVERY question MUST have a "hint" field (short, helpful, no spoilers)
${questionType === 'general' 
  ? `- Mix question types according to distribution (50% single, 20% multiple, 15% fillblank, 15% matching)
- Each question's "type" field MUST match its actual format ("single", "multiple", "fillblank", or "matching")
- For matching questions: use "matchingPairs" array instead of "options"
- For fillblank questions: text MUST contain _____`
  : `- Each question MUST have "type": "${questionType}"
${questionType === 'matching' ? '- Use "matchingPairs" array with "term" and "definition" fields' : '- Each question must have exactly 4 options'}
${questionType === 'fillblank' ? '- Question text MUST contain _____ (blank indicator)' : ''}`
}
${questionType !== 'matching' ? '- Only ONE option with "isCorrect": true' : '- Provide at least 4 matching pairs'}
- Return ONLY valid JSON, no additional text
- No trailing commas

${questionType === 'general' 
  ? `FINAL CHECK FOR GENERAL TYPE:
Before submitting, verify your JSON has:
- ${Math.max(1, Math.round(questionCount * 0.5))} questions with "type": "single"
- ${Math.max(1, Math.round(questionCount * 0.2))} questions with "type": "multiple"  
- ${Math.round(questionCount * 0.15)} questions with "type": "fillblank"
- ${Math.round(questionCount * 0.15)} questions with "type": "matching"
✓ Matching questions use "matchingPairs", others use "options"
✓ Multiple choice has 2-3 options with isCorrect: true

DO NOT generate all questions as "type": "single"!`
  : ''
}

Generate ${questionCount} questions about "${title}" NOW:`;

    try {
      const response = await axios.post(`${config.OLLAMA_URL}/api/generate`, {
        model: config.OLLAMA_MODEL,
        prompt: prompt,
        stream: false
      }, {
        timeout: 60000
      });

      const generatedText = response.data.response || '';
      const jsonMatch = generatedText.match(/\{[\s\S]*\}/);
      
      if (!jsonMatch) {
        throw new Error('No valid JSON found in AI response');
      }

      // Fix common JSON issues and parse
      let jsonStr = jsonMatch[0].replace(/,(\s*[}\]])/g, '$1');
      const parsed = JSON.parse(jsonStr);
      
      // Validate structure
      if (!parsed.questions || !Array.isArray(parsed.questions)) {
        throw new Error('Invalid response structure: missing questions array');
      }
      
      return parsed;
    } catch (error) {
      if (error.code === 'ECONNREFUSED') {
        throw new Error('Cannot connect to Ollama. Make sure Ollama is running on ' + config.OLLAMA_URL);
      }
      if (error.response) {
        throw new Error(`Ollama error: ${error.response.data?.error || error.message}`);
      }
      throw error;
    }
  }

  // Chat with AI
  static async chat(message) {
    try {
      const response = await axios.post(`${config.OLLAMA_URL}/api/generate`, {
        model: config.OLLAMA_MODEL,
        prompt: `You are a helpful quiz assistant. User asks: ${message}\nRespond helpfully and concisely.`,
        stream: false
      }, {
        timeout: 30000
      });

      return response.data.response || 'Sorry, I could not generate a response.';
    } catch (error) {
      throw new Error('Failed to chat with AI: ' + error.message);
    }
  }

  // Extract topics from text using AI
  static async extractTopicsFromText(text) {
    try {
      const prompt = `Analyze the following text and extract 5-10 key topics or subjects that could be used to generate quiz questions. Return ONLY a JSON array of topic strings, nothing else.

Text:
${text}

Return format: ["Topic 1", "Topic 2", "Topic 3", ...]

Topics:`;

      const response = await axios.post(`${config.OLLAMA_URL}/api/generate`, {
        model: config.OLLAMA_MODEL,
        prompt: prompt,
        stream: false
      }, {
        timeout: 30000
      });

      const generatedText = response.data.response || '';
      
      // Try to extract JSON array
      const jsonMatch = generatedText.match(/\[[\s\S]*?\]/);
      if (!jsonMatch) {
        // Fallback: split by lines and clean up
        const topics = generatedText
          .split('\n')
          .map(line => line.trim().replace(/^[-*•]\s*/, '').replace(/^["']|["']$/g, ''))
          .filter(line => line && line.length > 3 && line.length < 100);
        return topics.slice(0, 10);
      }

      const topics = JSON.parse(jsonMatch[0]);
      return Array.isArray(topics) ? topics.slice(0, 10) : [];
    } catch (error) {
      console.error('Topic extraction error:', error);
      return [];
    }
  }

  // Generate questions from selected topics
  static async generateQuestionsFromTopics(topics, sourceText, questionCount = 10) {
    try {
      const topicList = topics.join(', ');
      const contextSnippet = sourceText ? `\n\nSource context:\n${sourceText.substring(0, 2000)}` : '';

      const prompt = `Generate ${questionCount} quiz questions based on these topics: ${topicList}${contextSnippet}

Create a diverse mix of question types. Return ONLY valid JSON with this structure:

{
  "questions": [
    {
      "text": "Question text here?",
      "type": "single",
      "timeLimit": 30,
      "options": [
        {"text": "Option A", "isCorrect": false},
        {"text": "Option B", "isCorrect": true},
        {"text": "Option C", "isCorrect": false},
        {"text": "Option D", "isCorrect": false}
      ]
    }
  ]
}

Generate ${questionCount} questions NOW:`;

      const response = await axios.post(`${config.OLLAMA_URL}/api/generate`, {
        model: config.OLLAMA_MODEL,
        prompt: prompt,
        stream: false
      }, {
        timeout: 60000
      });

      const generatedText = response.data.response || '';
      const jsonMatch = generatedText.match(/\{[\s\S]*\}/);
      
      if (!jsonMatch) {
        throw new Error('No valid JSON found in AI response');
      }

      const jsonStr = jsonMatch[0].replace(/,(\s*[}\]])/g, '$1');
      const parsed = JSON.parse(jsonStr);
      
      return parsed.questions || [];
    } catch (error) {
      console.error('Generate questions from topics error:', error);
      return [];
    }
  }
}

export default AIService;
