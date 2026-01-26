export class CalendarEvent {
  constructor(data = {}) {
    this.id = data.id ?? null;
    this.user_id = data.user_id ?? null;
    this.title = data.title ?? '';
    this.start = data.start ?? null; // ISO string
    this.end = data.end ?? null; // ISO string
    this.notes = data.notes ?? null;
    this.created_at = data.created_at ?? null;
    this.updated_at = data.updated_at ?? null;
  }

  isValid() {
    return (
      this.user_id &&
      typeof this.title === 'string' &&
      this.title.trim().length > 0 &&
      !!this.start &&
      !!this.end
    );
  }

  toDatabase() {
    return {
      user_id: this.user_id,
      title: this.title,
      start_datetime: this.start,
      end_datetime: this.end,
      notes: this.notes,
    };
  }

  toJSON() {
    return {
      id: this.id,
      title: this.title,
      start: this.start,
      end: this.end,
      notes: this.notes,
    };
  }

  static fromDatabase(row) {
    const startISO = row.start_datetime ? new Date(row.start_datetime).toISOString() : null;
    const endISO = row.end_datetime ? new Date(row.end_datetime).toISOString() : null;

    return new CalendarEvent({
      id: row.id,
      user_id: row.user_id,
      title: row.title,
      start: startISO,
      end: endISO,
      notes: row.notes ?? null,
      created_at: row.created_at ?? null,
      updated_at: row.updated_at ?? null,
    });
  }
}

export default CalendarEvent;
