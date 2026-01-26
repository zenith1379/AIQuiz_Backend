-- Fix users table to use user_id instead of id
ALTER TABLE users CHANGE COLUMN id user_id INT NOT NULL AUTO_INCREMENT;

-- Fix quizzes table if needed
ALTER TABLE quizzes CHANGE COLUMN id quiz_id INT NOT NULL AUTO_INCREMENT;

-- Fix questions table if needed  
ALTER TABLE questions CHANGE COLUMN id question_id INT NOT NULL AUTO_INCREMENT;

-- Fix choices table if needed
ALTER TABLE choices CHANGE COLUMN id choice_id INT NOT NULL AUTO_INCREMENT;
