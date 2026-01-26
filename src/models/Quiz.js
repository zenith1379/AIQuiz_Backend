export class Quiz {
  constructor(data = {}) {
    this.quiz_id = data.quiz_id || null;
    this.user_id = data.user_id || null;
    this.title = data.title || '';
    this.description = data.description || '';
    this.image = data.image || null;
    this.created_at = data.created_at || null;
    this.questions = data.questions || [];
  }

  isValid() {
    return this.user_id && this.title && this.title.trim().length > 0;
  }

  hasQuestions() {
    return this.questions && this.questions.length > 0;
  }

  getQuestionCount() {
    return this.questions ? this.questions.length : 0;
  }

  toDatabase() {
    return {
      user_id: this.user_id,
      title: this.title,
      description: this.description,
      image: this.image
    };
  }

  toJSON() {
    return {
      quiz_id: this.quiz_id,
      user_id: this.user_id,
      title: this.title,
      description: this.description,
      image: this.image,
      created_at: this.created_at,
      questions: this.questions
    };
  }

  static fromDatabase(row) {
    return new Quiz(row);
  }
}

export default Quiz;
