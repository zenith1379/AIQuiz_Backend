// Test environment config
process.env.NODE_ENV = 'test';
process.env.JWT_SECRET = 'test-jwt-secret-key-12345';
process.env.GROQ_API_KEY = 'test-groq-api-key';
process.env.DB_HOST = 'localhost';
process.env.DB_PORT = '3306';
process.env.DB_NAME = 'test_quiz_db';
process.env.DB_USER = 'root';
process.env.DB_PASSWORD = '';

jest.setTimeout(30000);

afterAll(async () => {
  await new Promise(resolve => setTimeout(resolve, 500));
});
