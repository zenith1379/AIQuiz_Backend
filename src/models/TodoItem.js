export class TodoItem {
  constructor(data = {}) {
    this.id = data.id || null;
    this.user_id = data.user_id || null;
    this.task = data.task || '';
    this.due_date = data.due_date || null;
    this.is_completed = data.is_completed || false;
    this.created_at = data.created_at || null;
    this.updated_at = data.updated_at || null;
  }

  isValid() {
    return this.user_id && this.task && this.task.trim().length > 0;
  }

  toDatabase() {
    return {
      user_id: this.user_id,
      task: this.task,
      due_date: this.due_date,
      is_completed: this.is_completed,
    };
  }

  toJSON() {
    return {
      id: this.id,
      user_id: this.user_id,
      task: this.task,
      due_date: this.due_date,
      is_completed: this.is_completed,
      created_at: this.created_at,
      updated_at: this.updated_at,
    };
  }

  static fromDatabase(row) {
    // Convert MySQL boolean (0 or 1) to true/false
    const data = { ...row, is_completed: !!row.is_completed };
    return new TodoItem(data);
  }
}

export default TodoItem;
