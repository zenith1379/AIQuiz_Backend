// AuthService Unit Tests
import { jest } from '@jest/globals';

// Mocks
jest.unstable_mockModule('../../src/services/UserService.js', () => ({
  UserService: {
    getByEmail: jest.fn(),
    getById: jest.fn(),
    create: jest.fn(),
    update: jest.fn()
  }
}));

jest.unstable_mockModule('bcrypt', () => ({
  default: { hash: jest.fn(), compare: jest.fn() }
}));

jest.unstable_mockModule('../../src/models/index.js', () => ({
  User: {},
  PasswordResetToken: { create: jest.fn() }
}));

jest.unstable_mockModule('../../src/services/EmailService.js', () => ({
  EmailService: { sendPasswordResetEmail: jest.fn() }
}));

jest.unstable_mockModule('../../src/config/config.js', () => ({
  default: { RESET_PASSWORD_TOKEN_EXPIRY: 900000 }
}));

jest.unstable_mockModule('../../src/utils/logger.js', () => ({
  createLogger: jest.fn(() => ({ info: jest.fn(), error: jest.fn(), warn: jest.fn() }))
}));

const { UserService } = await import('../../src/services/UserService.js');
const bcrypt = (await import('bcrypt')).default;

describe('AuthService', () => {
  beforeEach(() => jest.clearAllMocks());

  describe('register', () => {
    it('registers new user', async () => {
      const userData = { username: 'testuser', email: 'test@example.com', password: 'password123' };
      
      UserService.getByEmail.mockResolvedValue(null);
      bcrypt.hash.mockResolvedValue('hashedPassword123');
      UserService.create.mockResolvedValue({ user_id: 1, username: 'testuser', email: 'test@example.com' });

      const { AuthService } = await import('../../src/services/AuthService.js');
      const result = await AuthService.register(userData);

      expect(UserService.getByEmail).toHaveBeenCalledWith('test@example.com');
      expect(bcrypt.hash).toHaveBeenCalledWith('password123', 10);
      expect(result).toHaveProperty('user_id');
    });

    it('throws on duplicate email', async () => {
      UserService.getByEmail.mockResolvedValue({ user_id: 1, email: 'existing@example.com' });

      const { AuthService } = await import('../../src/services/AuthService.js');
      await expect(AuthService.register({ 
        username: 'test', email: 'existing@example.com', password: 'pass123' 
      })).rejects.toThrow('Email already registered');
    });
  });

  describe('login', () => {
    it('returns user on valid credentials', async () => {
      const mockUser = { user_id: 1, email: 'test@example.com', password: 'hashedPassword' };
      UserService.getByEmail.mockResolvedValue(mockUser);
      bcrypt.compare.mockResolvedValue(true);

      const { AuthService } = await import('../../src/services/AuthService.js');
      const result = await AuthService.login({ email: 'test@example.com', password: 'password123' });

      expect(result).toEqual(mockUser);
    });

    it('throws on invalid email', async () => {
      UserService.getByEmail.mockResolvedValue(null);

      const { AuthService } = await import('../../src/services/AuthService.js');
      await expect(AuthService.login({ 
        email: 'none@example.com', password: 'pass' 
      })).rejects.toThrow('Invalid email or password');
    });

    it('throws on wrong password', async () => {
      UserService.getByEmail.mockResolvedValue({ user_id: 1, password: 'hashed' });
      bcrypt.compare.mockResolvedValue(false);

      const { AuthService } = await import('../../src/services/AuthService.js');
      await expect(AuthService.login({ 
        email: 'test@example.com', password: 'wrong' 
      })).rejects.toThrow('Invalid email or password');
    });
  });

  describe('changePassword', () => {
    it('updates password successfully', async () => {
      const mockUser = { user_id: 1, email: 'test@example.com', password: 'oldHash' };
      UserService.getById.mockResolvedValue(mockUser);
      UserService.getByEmail.mockResolvedValue(mockUser);
      bcrypt.compare.mockResolvedValue(true);
      bcrypt.hash.mockResolvedValue('newHash');
      UserService.update.mockResolvedValue(true);

      const { AuthService } = await import('../../src/services/AuthService.js');
      const result = await AuthService.changePassword(1, 'oldpass', 'newpass');

      expect(result).toBe(true);
      expect(UserService.update).toHaveBeenCalledWith(1, { password: 'newHash' });
    });

    it('throws on user not found', async () => {
      UserService.getById.mockResolvedValue(null);

      const { AuthService } = await import('../../src/services/AuthService.js');
      await expect(AuthService.changePassword(999, 'old', 'new')).rejects.toThrow('User not found');
    });

    it('throws on wrong old password', async () => {
      const mockUser = { user_id: 1, email: 'test@example.com', password: 'hash' };
      UserService.getById.mockResolvedValue(mockUser);
      UserService.getByEmail.mockResolvedValue(mockUser);
      bcrypt.compare.mockResolvedValue(false);

      const { AuthService } = await import('../../src/services/AuthService.js');
      await expect(AuthService.changePassword(1, 'wrongold', 'new')).rejects.toThrow('Incorrect old password');
    });
  });
});
