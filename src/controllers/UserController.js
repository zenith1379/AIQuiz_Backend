import { UserService } from '../services/index.js';

export class UserController {
  // Get all users
  static async getAll(req, res, next) {
    try {
      const users = await UserService.getAll();
      res.json(users);
    } catch (error) {
      next(error);
    }
  }

  // Get user by ID
  static async getById(req, res, next) {
    try {
      const { id } = req.params;
      const user = await UserService.getById(id);

      if (!user) {
        return res.status(404).json({ error: 'User not found' });
      }

      res.json(user);
    } catch (error) {
      next(error);
    }
  }

  // Update user
  static async update(req, res, next) {
    try {
      const { id } = req.params;
      const userData = req.body;

      const user = await UserService.update(id, userData);

      res.json({
        message: 'User updated successfully',
        user
      });
    } catch (error) {
      next(error);
    }
  }

  // Delete user
  static async delete(req, res, next) {
    try {
      const { id } = req.params;
      const deleted = await UserService.delete(id);

      if (!deleted) {
        return res.status(404).json({ error: 'User not found' });
      }

      res.json({ message: 'User deleted successfully' });
    } catch (error) {
      next(error);
    }
  }

  // Get users by role
  static async getByRole(req, res, next) {
    try {
      const { role } = req.params;
      const users = await UserService.getByRole(role);
      res.json(users);
    } catch (error) {
      next(error);
    }
  }

  // Get user stats
  static async getStats(req, res, next) {
    try {
      const stats = await UserService.getStats();
      res.json(stats);
    } catch (error) {
      next(error);
    }
  }
}

export default UserController;
