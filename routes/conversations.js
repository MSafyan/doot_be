const router = require('express').Router();
const Channel = require('../models/Channel');
const Conversation = require('../models/Conversation');
const Message = require('../models/Message');

//new conv

router.post('/', async (req, res) => {
  const newConversation = new Conversation({
    members: [req.body.senderId, req.body.receiverId],
  });

  try {
    const savedConversation = await newConversation.save();
    res.status(200).json(savedConversation);
  } catch (err) {
    res.status(500).json(err);
  }
});

//get conv of a user

router.get('/:userId', async (req, res) => {
  try {
    let mem = {};
    const conversations = await Conversation.find({
      members: { $in: [req.params.userId] },
    }).populate('members');
    const others = conversations?.map((conv) => {
      mem = conv.members.filter((member) => member.id !== req.params.userId)[0];

      return mem;
    });
    res.status(200).json(others);
  } catch (err) {
    res.status(500).json(err);
  }
});

// get conv includes two userId

router.get('/find/:firstUserId/:secondUserId', async (req, res) => {
  try {
    const { firstUserId, secondUserId } = req.params;

    const conversation = await Conversation.findOne({
      members: { $all: [firstUserId, secondUserId] },
    });

    const messages = await Message.find({
      conversationId: conversation.id,
    });

    res.status(200).json({ messages });
    // res.status(200).json(conversation);
  } catch (err) {
    res.status(500).json(err);
  }
});

module.exports = router;
