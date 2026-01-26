import { TodoService } from '../services/TodoService.js';

const getAllTodos = async (req, res, next) => {
  try {
    const todos = await TodoService.getAllByUserId(req.user.user_id);
    res.status(200).json(todos);
  } catch (error) {
    next(error);
  }
};

const createTodo = async (req, res, next) => {
  const { task, due_date } = req.body;
  const user_id = req.user.user_id;

  if (!task) {
    return res.status(400).json({ message: 'Task is a required field.' });
  }

  try {
    const newTodo = await TodoService.create({ user_id, task, due_date });
    res.status(201).json(newTodo);
  } catch (error) {
    next(error);
  }
};

const updateTodo = async (req, res, next) => {
  const { id } = req.params;
  const user_id = req.user.user_id;
  const updates = req.body; // { task, due_date, is_completed }

  // Prevent updating user_id or id
  delete updates.user_id;
  delete updates.id;

  if (Object.keys(updates).length === 0) {
    return res.status(400).json({ message: 'No update data provided.' });
  }

  try {
    const existingTodo = await TodoService.findById(id, user_id);
    if (!existingTodo) {
      return res.status(404).json({ message: 'Todo item not found.' });
    }

    const updatedTodo = await TodoService.update(id, user_id, updates);
    res.status(200).json(updatedTodo);
  } catch (error) {
    next(error);
  }
};

const deleteTodo = async (req, res, next) => {
  const { id } = req.params;
  const user_id = req.user.user_id;

  try {
    const success = await TodoService.remove(id, user_id);
    if (!success) {
      return res.status(404).json({ message: 'Todo item not found.' });
    }
    res.status(204).send();
  } catch (error) {
    next(error);
  }
};

const getTodoStats = async (req, res, next) => {
  try {
    const stats = await TodoService.getStatsByUserId(req.user.user_id);
    res.status(200).json(stats);
  } catch (error) {
    next(error);
  }
};

export const TodoController = {
  getAllTodos,
  createTodo,
  updateTodo,
  deleteTodo,
  getTodoStats,
};
