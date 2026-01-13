import { Server as SocketServer } from 'socket.io';
import { Server as HTTPServer } from 'http';

let io: SocketServer;

export const initializeSocket = (server: HTTPServer): SocketServer => {
  io = new SocketServer(server, {
    cors: {
      origin: process.env.CLIENT_URL,
      methods: ['GET', 'POST'],
    },
  });

  io.on('connection', (socket) => {
    console.log('Client connected:', socket.id);

    socket.on('join-poll', (pollId: string) => {
      socket.join(`poll-${pollId}`);
    });

    socket.on('leave-poll', (pollId: string) => {
      socket.leave(`poll-${pollId}`);
    });

    socket.on('disconnect', () => {
      console.log('Client disconnected:', socket.id);
    });
  });

  return io;
};

export const emitPollUpdate = (pollId: string, poll: any): void => {
  if (io) {
    io.to(`poll-${pollId}`).emit('poll-updated', poll);
    io.emit('polls-changed');
  }
};

export const emitNewPoll = (poll: any): void => {
  if (io) {
    io.emit('poll-created', poll);
  }
};
