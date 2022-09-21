const router = require('express').Router();
const Channel = require('../models/Channel');
const Message = require('../models/Message');
const User = require('../models/User');

//new conv

router.post('/', async (req, res) => {
  const newChannel = new Channel({
    name: req.body.name,
    members: req.body.members,
  });

  try {
    const savedConversation = await newChannel.save();
    const users = await User.find({ _id: { $in: req.body.members } });
    console.log('User', users);
    // const user = getUser(meta.receiver);
    const io = req.app.get('io');
    users.forEach((user) => {
      if (user.socketId) {
        io.to(user.socketId).emit('newGroup');
      }
    });
    res.status(200).json(savedConversation);
  } catch (err) {
    res.status(500).json(err);
  }
});

//get conv of a user

router.get('/:userId', async (req, res) => {
  try {
    let mem = {};
    const conversations = await Channel.find({
      members: { $in: [req.params.userId] },
    }).populate(['members']);

    let convos = [
      ...conversations.map((c) => {
        const newObj = {
          id: c.id,
          _id: c.id,
          name: c.name,
          members: c.members,
          isChannel: true,
        };
        return newObj;
      }),
    ];
    console.log('Others', convos);

    res.status(200).json(convos);
  } catch (err) {
    res.status(500).json(err);
  }
});

// get conv includes two userId

router.get('/find/:id', async (req, res) => {
  try {
    const conversation = await Channel.findById(req.params.id).populate([
      'members',
    ]);

    const messages = await Message.find({
      channelId: conversation.id,
    });

    res.status(200).json({
      id: conversation.id,
      _id: conversation.id,
      name: conversation.name,
      members: conversation.members,
      messages,
    });
    // res.status(200).json(conversation);
  } catch (err) {
    res.status(500).json(err);
  }
});

router.get('/messages/:channelId', async (req, res) => {
  try {
    const { channelId } = req.params;

    // const conversation = await Channel.findById(channelId);
    const messages = await Message.find({
      channelId: channelId,
    });

    res.status(200).json({ messages });
    // res.status(200).json(conversation);
  } catch (err) {
    res.status(500).json(err);
  }
});

module.exports = router;
