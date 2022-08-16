const router = require("express").Router();
const Message = require("../models/Message");
const Conversation = require("../models/Conversation");

//add

router.post("/", async (req, res) => {
	const conversation = await Conversation.findOne({
		members: { $all: [req.body.meta.sender, req.body.meta.receiver] },
	});

	const newMessage = new Message({
		text: req.body.text,
		sender: req.body.meta.sender,
		conversationId: conversation.id,
	});

	try {
		const savedMessage = await newMessage.save();
		res.status(200).json(savedMessage);
	} catch (err) {
		res.status(500).json(err);
	}
});

//get

router.get("/:conversationId", async (req, res) => {
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
