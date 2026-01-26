export class Choice {
  constructor(data = {}) {
    this.choice_id = data.choice_id || null;
    this.question_id = data.question_id || null;
    this.choice_text = data.choice_text || '';
    this.is_correct = data.is_correct || false;
    this.metadata = data.metadata || null;
  }

  isValid() {
    return this.question_id && this.choice_text && this.choice_text.trim().length > 0;
  }

  toDatabase() {
    const dbData = {
      question_id: this.question_id,
      choice_text: this.choice_text,
      is_correct: this.is_correct ? 1 : 0
    };
    
    if (this.metadata) {
      dbData.metadata = this.metadata;
    }
    
    return dbData;
  }

  toJSON() {
    const jsonData = {
      choice_id: this.choice_id,
      question_id: this.question_id,
      choice_text: this.choice_text,
      is_correct: this.is_correct
    };
    
    if (this.metadata) {
      jsonData.metadata = this.metadata;
    }
    
    return jsonData;
  }

  static fromDatabase(row) {
    return new Choice({
      choice_id: row.id || row.choice_id,
      question_id: row.question_id,
      choice_text: row.choice_text || row.text,
      is_correct: Boolean(row.is_correct),
      metadata: row.metadata
    });
  }
}

export default Choice;
