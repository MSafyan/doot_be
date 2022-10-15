const Stream = require('../models/stream');
const json = require('../utils/jsonresponse');

// create a new Notification for single user
exports.createStream = async (req, res) => {
	try {
		var stream = await Stream.findOne({
			owner: req.user._id,
			peerId: req.body.peerId,
		});
		if (!stream) {
			stream = await Stream.create({
				owner: req.user._id,
				peerId: req.body.peerId,
			});
		}
		// 		else {
		// 	stream = await Stream.findByIdAndUpdate(stream.id, { obj: req.body.obj });
		// }
		json(res, 201, null, 'stream created');
	} catch (error) {
		json(res, 500, error.message);
	}
};

exports.getStreams = async (req, res) => {
	try {
		const streams = await Stream.find().populate('owner');
		json(res, 201, null, streams);
	} catch (error) {
		json(res, 500, error.message);
	}
};

exports.deleteStream = async (req, res) => {
	try {
		const stream = await Stream.findOneAndRemove({ owner: req.user._id });
		if (!stream) return json(res, 404, 'stream not Found');
		json(res, 201, null, 'successfully ended...');
	} catch (error) {
		json(res, 500, error.message);
	}
};
