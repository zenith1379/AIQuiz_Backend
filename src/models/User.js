export class User {
  constructor(data = {}) {
    this.user_id = data.user_id || null;
    this.username = data.username || '';
    this.email = data.email || '';
    this.password = data.password || '';
    this.role = data.role || 'student';
    this.created_at = data.created_at || null;
  }

  // Validation methods
  isValid() {
    return this.username && this.email && this.validateEmail(this.email);
  }

  validateEmail(email) {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(String(email).toLowerCase());
  }

  isTeacher() {
    return this.role === 'teacher';
  }

  isStudent() {
    return this.role === 'student';
  }

  isAdmin() {
    return this.role === 'admin';
  }

  getInitials() {
    if (!this.username) return '';
    return this.username.charAt(0).toUpperCase();
  }

  // Format for database
  toDatabase() {
    return {
      username: this.username,
      email: this.email,
      password: this.password,
      dob: this.dob,
      role: this.role,
      avatar: this.avatar,
      is_premium: this.is_premium,
      subscription_tier: this.subscription_tier,
      subscription_expires_at: this.subscription_expires_at,
    };
  }

  // Format for API response (exclude password)
  toJSON() {
    const { password, ...userWithoutPassword } = this;
    return userWithoutPassword;
  }

  // Create from database row
  static fromDatabase(row) {
    // Map database 'id' to 'user_id' for consistency
    const data = { 
      ...row, 
      user_id: row.id || row.user_id,
      is_premium: !!row.is_premium 
    };
    return new User(data);
  }
}

export default User;
