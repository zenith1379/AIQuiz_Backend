import { CalendarService } from '../services/CalendarService.js';

const getEffectiveUserId = (req) => {
  // Token payload is inconsistent across this codebase; support both.
  return req.user?.userId ?? req.user?.user_id ?? null;
};

const assertUserMatchIfProvided = (req, effectiveUserId) => {
  const providedUserId = req.query?.userId ?? req.body?.userId ?? req.body?.user_id;
  if (providedUserId == null) return;

  const normalizedProvided = Number(providedUserId);
  if (Number.isNaN(normalizedProvided)) return;

  if (normalizedProvided !== Number(effectiveUserId)) {
    const error = new Error('userId does not match authenticated user');
    error.statusCode = 403;
    throw error;
  }
};

const parseISODate = (value) => {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return null;
  // Store as MySQL DATETIME string (YYYY-MM-DD HH:MM:SS)
  const iso = date.toISOString();
  return iso.slice(0, 19).replace('T', ' ');
};

const getAllEvents = async (req, res, next) => {
  try {
    const userId = getEffectiveUserId(req);
    if (!userId) return res.status(401).json({ error: 'Authentication required.' });

    assertUserMatchIfProvided(req, userId);

    const events = await CalendarService.getAllByUserId(userId);
    res.status(200).json(events);
  } catch (error) {
    next(error);
  }
};

const createEvent = async (req, res, next) => {
  try {
    const userId = getEffectiveUserId(req);
    if (!userId) return res.status(401).json({ error: 'Authentication required.' });

    assertUserMatchIfProvided(req, userId);

    // FE sends: { userId, event: { title, start, end, notes? } }
    // Also accept: { title, start, end, notes? }
    const eventPayload = req.body?.event ?? req.body ?? {};
    const { title, start, end, notes } = eventPayload;

    // Allow event with only notes OR only title OR both
    if ((!title || title.trim().length === 0) && (!notes || notes.trim().length === 0)) {
      return res.status(400).json({ error: 'title or notes is required' });
    }

    const startDb = parseISODate(start);
    const endDb = parseISODate(end);

    if (!startDb || !endDb) {
      return res.status(400).json({ error: 'start and end must be valid datetimes' });
    }

    if (new Date(end).getTime() < new Date(start).getTime()) {
      return res.status(400).json({ error: 'end must be greater than or equal to start' });
    }

    const created = await CalendarService.create({
      user_id: userId,
      title: title?.trim() || '',
      start: startDb,
      end: endDb,
      notes: notes ?? null,
    });

    res.status(201).json({ event: created });
  } catch (error) {
    next(error);
  }
};

const deleteEvent = async (req, res, next) => {
  try {
    const userId = getEffectiveUserId(req);
    if (!userId) return res.status(401).json({ error: 'Authentication required.' });

    assertUserMatchIfProvided(req, userId);

    const { id } = req.params;
    const success = await CalendarService.remove(id, userId);
    if (!success) return res.status(404).json({ message: 'Event not found.' });

    res.status(204).send();
  } catch (error) {
    next(error);
  }
};

const updateEvent = async (req, res, next) => {
  try {
    const userId = getEffectiveUserId(req);
    if (!userId) return res.status(401).json({ error: 'Authentication required.' });

    assertUserMatchIfProvided(req, userId);

    const { id } = req.params;
    const eventPayload = req.body?.event ?? req.body ?? {};
    const { title, start, end, notes } = eventPayload;

    // Validation: Allow title or notes (or both)
    if ((!title || title.trim().length === 0) && (!notes || notes.trim().length === 0)) {
      return res.status(400).json({ error: 'title or notes is required' });
    }

    const startDb = start ? parseISODate(start) : null;
    const endDb = end ? parseISODate(end) : null;

    if (startDb && endDb && new Date(end).getTime() < new Date(start).getTime()) {
      return res.status(400).json({ error: 'end must be greater than or equal to start' });
    }

    const updates = {};
    if (title !== undefined) updates.title = title.trim();
    if (startDb) updates.start = startDb;
    if (endDb) updates.end = endDb;
    if (notes !== undefined) updates.notes = notes ?? null;

    const updated = await CalendarService.update(id, userId, updates);
    if (!updated) return res.status(404).json({ message: 'Event not found.' });

    res.status(200).json({ event: updated });
  } catch (error) {
    next(error);
  }
};

export const CalendarController = {
  getAllEvents,
  createEvent,
  updateEvent,
  deleteEvent,
};
