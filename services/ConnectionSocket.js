const User = require('../models/User');

function ConnectionSocket(io) {
  return (socket) => {
    //when ceonnect
    console.log('a user connected.');

    //take userId and socketId from user
    socket.on('addUser', async (userId) => {
      const socketId = socket.id;
      const user = await User.findOneAndUpdate({ _id: userId }, { socketId });
      console.log('Added User', user.username, socketId);
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

    socket.emit('me', socket.id);

    socket.on('callUser', async ({ userToCall, signalData, from }) => {
      const user = await User.findOne({ _id: userToCall });
      const userFrom = await User.findOne({ socketId: from });
      console.log('Users', user, userFrom);
      console.log(
        `${userFrom.fullname} - ${userFrom.socketId} is calling ${user.fullname} - ${user.socketId}`
      );
      io.to(user.socketId).emit('callUser', {
        signal: signalData,
        from: userFrom.socketId,
        name: userFrom.fullname,
      });
    });

    socket.on('answerCall', (data) => {
      console.log('Accepted call', data.to);
      io.to(data.to).emit('callAccepted', {
        signal: data.signal,
        by: socket.id,
      });
    });

    socket.on('endCall', async ({ socketId }) => {
      io.to(socketId).emit('callEnded', { from: socket.id });
    });

    socket.on('disconnect', async () => {
      console.log('a user disconnected!');
      socket.broadcast.emit('callEnded', { from: socket.id });

      const user = await User.findOneAndUpdate(
        { socketId: socket.id },
        { socketId: null }
      );
      console.log(user);
    });
  };
}
module.exports = ConnectionSocket;
