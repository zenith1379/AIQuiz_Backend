// src/socket/socketHandler.js
import { handleNewConnection } from '../services/SpeakService.js';
import { createLogger } from '../utils/logger.js';

const log = createLogger('socket');

export const initializeSocket = (io) => {
  // Store session rooms
  const sessionRooms = new Map(); // sessionCode -> { host: socketId, students: Map }

  io.on('connection', (socket) => {
    log.info('A user connected via WebSocket:', socket.id);
    
    // Speaking practice connection
    handleNewConnection(socket);

    // Quiz session handling
    const { sessionCode, role } = socket.handshake.query;

    if (sessionCode) {
      socket.join(sessionCode);
      log.info(`${role} joined session: ${sessionCode}`);

      // Initialize room if doesn't exist
      if (!sessionRooms.has(sessionCode)) {
        sessionRooms.set(sessionCode, {
          host: null,
          students: new Map()
        });
      }

      const room = sessionRooms.get(sessionCode);

      // Handle host
      if (role === 'host') {
        room.host = socket.id;
        
        // Send current students to host
        const students = Array.from(room.students.entries()).map(([id, data]) => ({
          id,
          ...data
        }));
        socket.emit('initial-students', students);
      }

      // Handle student joining
      socket.on('student-join', (studentData) => {
        const studentInfo = {
          id: socket.id,
          name: studentData.name || 'Anonymous',
          joinedAt: new Date().toISOString()
        };

        room.students.set(socket.id, studentInfo);

        // Notify host
        if (room.host) {
          io.to(room.host).emit('student-joined', studentInfo);
        }

        // Notify all students
        io.to(sessionCode).emit('student-count-update', room.students.size);
        io.to(sessionCode).emit('play-sound', 'student-join');

        log.info(`Student joined: ${studentInfo.name}`);
      });

      // Handle kick student
      socket.on('kick-student', (studentId) => {
        if (role === 'host') {
          room.students.delete(studentId);
          
          io.to(studentId).emit('kicked', { 
            message: 'You have been removed from the session' 
          });
          
          const studentSocket = io.sockets.sockets.get(studentId);
          if (studentSocket) {
            studentSocket.leave(sessionCode);
            studentSocket.disconnect(true);
          }

          io.to(sessionCode).emit('student-count-update', room.students.size);
          io.to(room.host).emit('student-left', studentId);

          log.warn(`Student ${studentId} kicked`);
        }
      });

      // Handle start quiz
      socket.on('start-quiz', (data) => {
        if (role === 'host') {
          log.info(`Starting quiz in session ${sessionCode}`);
          
          io.to(sessionCode).emit('quiz-started', {
            sessionId: data.sessionId,
            quizId: data.quizId,
            timestamp: new Date().toISOString()
          });

          io.to(sessionCode).emit('play-sound', 'quiz-start');
        }
      });

      // Handle answer submission
      socket.on('submit-answer', (answerData) => {
        if (room.host) {
          io.to(room.host).emit('answer-received', {
            studentId: socket.id,
            ...answerData
          });
        }

        socket.emit('answer-feedback', {
          isCorrect: answerData.isCorrect,
          points: answerData.points
        });

        const sound = answerData.isCorrect ? 'correct' : 'incorrect';
        socket.emit('play-sound', sound);
      });

      // Handle next question
      socket.on('next-question', (questionData) => {
        if (role === 'host') {
          io.to(sessionCode).emit('question-update', questionData);
          io.to(sessionCode).emit('play-sound', 'next-question');
        }
      });

      // Handle end quiz
      socket.on('end-quiz', (results) => {
        if (role === 'host') {
          io.to(sessionCode).emit('quiz-ended', results);
          io.to(sessionCode).emit('play-sound', 'quiz-end');
          log.info(`Quiz ended in session ${sessionCode}`);
        }
      });

      // Handle disconnect
      const handleSessionDisconnect = () => {
        if (role === 'host') {
          io.to(sessionCode).emit('host-disconnected', {
            message: 'Host has left the session'
          });
          sessionRooms.delete(sessionCode);
        } else {
          room.students.delete(socket.id);
          
          if (room.host) {
            io.to(room.host).emit('student-left', socket.id);
          }
          
          io.to(sessionCode).emit('student-count-update', room.students.size);
        }
      };

      socket.on('leave-session', handleSessionDisconnect);
    }

    socket.on('disconnect', () => {
      log.info('A user disconnected:', socket.id);
      
      // Clean up session if in one
      if (sessionCode && sessionRooms.has(sessionCode)) {
        const room = sessionRooms.get(sessionCode);
        if (role === 'host') {
          io.to(sessionCode).emit('host-disconnected');
          sessionRooms.delete(sessionCode);
        } else {
          room.students.delete(socket.id);
          if (room.host) {
            io.to(room.host).emit('student-left', socket.id);
          }
        }
      }
    });
  });
};
