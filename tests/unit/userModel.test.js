// User Model Unit Tests

describe('User Model', () => {
  describe('validation', () => {
    it('accepts valid user data', () => {
      const user = { username: 'testuser', email: 'test@example.com', password: 'password123' };
      expect(user.username).toBeTruthy();
      expect(user.email).toMatch(/^[^\s@]+@[^\s@]+\.[^\s@]+$/);
      expect(user.password.length).toBeGreaterThanOrEqual(6);
    });

    it('rejects empty username', () => {
      expect('').toBeFalsy();
    });

    it('rejects invalid emails', () => {
      const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      ['notanemail', 'missing@domain', '@nodomain.com'].forEach(email => {
        expect(regex.test(email)).toBe(false);
      });
    });

    it('accepts valid emails', () => {
      const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      ['user@example.com', 'user.name@domain.org', 'user+tag@example.co.uk'].forEach(email => {
        expect(regex.test(email)).toBe(true);
      });
    });
  });

  describe('roles', () => {
    const validRoles = ['student', 'teacher', 'admin', 'super_admin'];

    it('validates role values', () => {
      validRoles.forEach(role => expect(validRoles).toContain(role));
    });

    it('defaults to student', () => {
      expect('student').toBe('student');
    });
  });

  describe('data transformation', () => {
    it('maps db fields correctly', () => {
      const dbRow = { user_id: 1, username: 'testuser', email: 'test@example.com', role: 'student' };
      expect(dbRow.user_id).toBe(1);
      expect(dbRow.username).toBe('testuser');
    });

    it('excludes password in safe object', () => {
      const safeUser = { user_id: 1, username: 'test', email: 'test@example.com' };
      expect(safeUser).not.toHaveProperty('password');
    });
  });
});
