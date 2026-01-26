import express from 'express';
import { TodoController } from '../controllers/TodoController.js';
import { verifyToken } from '../middleware/auth.js';

const router = express.Router();

// All routes in this file are protected and require authentication
router.use(verifyToken);

// @route   GET /api/todos
// @desc    Fetch all todo items for the authenticated user
// @access  Private
router.get('/', TodoController.getAllTodos);

// @route   POST /api/todos
// @desc    Create a new todo item
// @access  Private
router.post('/', TodoController.createTodo);

// @route   GET /api/todos/stats
// @desc    Get statistics about the user's todos
// @access  Private
router.get('/stats', TodoController.getTodoStats);

// @route   PUT /api/todos/:id
// @desc    Update an existing todo item
// @access  Private
router.put('/:id', TodoController.updateTodo);

// @route   DELETE /api/todos/:id
// @desc    Delete a todo item
// @access  Private
router.delete('/:id', TodoController.deleteTodo);

export default router;
