const router = require('express').Router();
const Message = require('../models/Message');
const Conversation = require('../models/Conversation');
const { upload } = require('../services/FileUploading');
const Channel = require('../models/Channel');
const User = require('../models/User');

//add

router.post('/', upload.single('file'), async (req, res) => {
  const data = JSON.parse(req.body.data);

  const { isChannel } = data;

  let conversation;

  if (!isChannel) {
    try {
      conversation = await Conversation.findOne({
        members: { $all: [data.meta.sender, data.meta.receiver] },
      });
      if (!conversation) {
        const newConvo = new Conversation({
          members: [data.meta.sender, data.meta.receiver],
        });
        conversation = await newConvo.save();
        console.log('New Convo made', conversation);
      }
    } catch (error) {}
  } else {
    conversation = await Channel.findById(data.meta.receiver);
  }

  const file = req.file;

  const fName = data.isFile ? file.filename : null;

  console.log('New Message here', data);
  const newMessage = new Message({
    text: data.text,
    sender: data.meta.sender,
    file: fName,
  });

  if (isChannel) newMessage.channelId = conversation._id;
  else newMessage.conversationId = conversation._id;

  try {
    const savedMessage = await newMessage.save();
    res.status(200).json(savedMessage);
    try {
      const users = await User.find({
        _id: { $in: [data.meta.receiver, ...conversation.members] },
      });
      console.log('User', users);
      // const user = getUser(meta.receiver);
      const io = req.app.get('io');
      users.forEach((user) => {
        if (user._id == data.meta.sender) return;
        if (user.socketId) {
          io.to(user.socketId).emit('getMessage', {
            sender: isChannel ? conversation._id : data.meta.sender,
            text: savedMessage.text,
            createdAt: savedMessage.createdAt,
            file: savedMessage.file,
          });
        }
      });
    } catch (error) {
      console.error('Error in the sockets', error);
    }
  } catch (err) {
    res.status(500).json(err);
  }
});

//get

router.get('/:conversationId', async (req, res) => {
  try {
    const messages = await Message.find({
      conversationId: req.params.conversationId,
    });
    res.status(200).json(messages);
  } catch (err) {
    res.status(500).json(err);
  }
});

module.exports = router;
