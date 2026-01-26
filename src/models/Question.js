export class Question {
  constructor(data = {}) {
    this.question_id = data.question_id || null;
    this.quiz_id = data.quiz_id || null;
    this.question_text = data.question_text || '';
    this.question_type = data.question_type || 'single';
    this.time_limit = data.time_limit || 30;
    this.choices = data.choices || [];
  }

  isValid() {
    return this.quiz_id && this.question_text && this.question_text.trim().length > 0;
  }

  hasChoices() {
    return this.choices && this.choices.length > 0;
  }

  hasCorrectAnswer() {
    return this.choices && this.choices.some(c => c.is_correct);
  }

  isSingleChoice() {
    return this.question_type === 'single';
  }

  isMultipleChoice() {
    return this.question_type === 'multiple';
  }

  toDatabase() {
    return {
      quiz_id: this.quiz_id,
      question_text: this.question_text,
      question_type: this.question_type,
      time_limit: this.time_limit
    };
  }

  toJSON() {
    return {
      question_id: this.question_id,
      quiz_id: this.quiz_id,
      question_text: this.question_text,
      question_type: this.question_type,
      time_limit: this.time_limit,
      choices: this.choices
    };
  }

  static fromDatabase(row) {
    return new Question({
      question_id: row.id || row.question_id,
      quiz_id: row.quiz_id,
      question_text: row.question_text || row.text,
      question_type: row.question_type || 'single',
      time_limit: row.time_limit || 30,
      choices: row.choices || []
    });
  }
}

export default Question;
