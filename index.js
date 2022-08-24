const express = require('express');
const app = express();
const httpServer = require('http').Server(app);
const cors = require('cors');
const { instrument } = require('@socket.io/admin-ui');
const io = require('socket.io')(httpServer, {
  cors: {
    origin: ['http://localhost:3000', 'https://admin.socket.io'],
    methods: '*',
    credentials: true,
  },
});
const helmet = require('helmet');
const morgan = require('morgan');
const { v4: uuidV4 } = require('uuid');
const mongoose = require('mongoose');
const dotenv = require('dotenv');

const userRoute = require('./routes/users');
const authRoute = require('./routes/auth');
const postRoute = require('./routes/posts');
const conversationRoute = require('./routes/conversations');
const messageRoute = require('./routes/messages');
const User = require('./models/User');

dotenv.config();

//middleware
app.use(express.json());
app.use(helmet());
app.use(morgan('common'));

app.use(cors());

mongoose
  .connect(process.env.DATABASE_LOCAL, {
    useNewUrlParser: true,
  })
  .then(() => console.log('DB connection successful!'));

app.use('/api/auth', authRoute);
app.use('/api/users', userRoute);
app.use('/api/posts', postRoute);
app.use('/api/conversations', conversationRoute);
app.use('/api/messages', messageRoute);

let users = [];

const addUser = (userId, socketId) => {
  !users.some((user) => user.userId === userId) &&
    users.push({ userId, socketId });
};

const removeUser = (socketId) => {
  users = users.filter((user) => user.socketId !== socketId);
};

const getUser = (userId) => {
  return users.find((user) => user.userId === userId);
};

io.on('connection', (socket) => {
  //when ceonnect
  console.log('a user connected.');

  //take userId and socketId from user
  socket.on('addUser', async (userId) => {
    const user = await User.findOneAndUpdate(
      { _id: userId },
      { socketId: socket.id }
    );
    console.log('Added User', user.username, socket.id);
  });

  //send and get message
  socket.on('sendMessage', async ({ meta, text, time }) => {
    const user = await User.findOne({ _id: meta.receiver });
    // const user = getUser(meta.receiver);
    if (user.socketId) {
      io.to(user.socketId).emit('getMessage', {
        sender: meta.sender,
        text,
        createdAt: time,
      });
    }
  });

  // socket.emit("me", socket.id);

  // socket.on("disconnect", () => {
  // 	socket.broadcast.emit("callEnded");
  // });

  socket.emit('me', socket.id);

  socket.on('callUser', async ({ userToCall, signalData, from }) => {
    const user = await User.findOne({ _id: userToCall });
    const userFrom = await User.findOne({ socketId: from });
    console.log(
      `${user.fullname} - ${user.socketId} is calling ${userFrom.fullname} - ${userFrom.socketId}`
    );
    io.to(user.socketId).emit('callUser', {
      signal: signalData,
      from: userFrom.socketId,
      name: userFrom.fullname,
    });
  });

  socket.on('answerCall', (data) => {
    console.log('Accepted call', data.to);
    io.to(data.to).emit('callAccepted', { signal: data.signal });
  });
  socket.on('disconnect', async () => {
    console.log('a user disconnected!');
    socket.broadcast.emit('callEnded');

    const user = await User.findOneAndUpdate(
      { socketId: socket.id },
      { socketId: null }
    );
    console.log(user);
    removeUser(socket.id);
    io.emit('getUsers', users);
  });
});

const port = process.env.PORT || 8000;
const server = httpServer.listen(port, () => {
  console.log(`App running on port ${port}...`);
});

instrument(io, { auth: false });
process.on('unhandledRejection', (err) => {
  console.log('UNHANDLED REJECTION! 💥 Shutting down...');
  console.log(err.name, err.message);
  // server.close(() => {
  // 	process.exit(1);
  // });
});

process.on('SIGTERM', () => {
  console.log('👋 SIGTERM RECEIVED. Shutting down gracefully');
  server.close(() => {
    console.log('💥 Process terminated!');
  });
});
