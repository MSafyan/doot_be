const mongoose = require('mongoose');

const postSchema = mongoose.Schema({
	description: String,
	imageUrl: String,
	videoUrl: String,
	owner: {
		type: mongoose.Schema.Types.ObjectId,
		ref: 'User',
	},
	likes: [
		{
			type: mongoose.Schema.Types.ObjectId,
			ref: 'User',
		},
	],
	comments: [
		{
			user: {
				type: mongoose.Schema.Types.ObjectId,
				ref: 'User',
			},
			comment: {
				type: String,
				required: true,
			},
			createdAt: {
				type: Date,
				default: Date.now,
			},
		},
	],
	share: {
		user: {
			type: mongoose.Schema.Types.ObjectId,
			ref: 'User',
		},
		isShare: {
			type: Boolean,
			default: false,
		},
		shareCount: {
			type: Number,
			default: 0,
		},
	},
	createdAt: {
		type: Date,
		default: Date.now,
	},
});

module.exports = mongoose.model('Postss', postSchema);
