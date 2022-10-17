const mongoose = require('mongoose');

const collectionSchema = mongoose.Schema({
	collectionName: {
		type: String,
		unique: true,
		trim: true,
	},
	owner: {
		type: mongoose.Schema.Types.ObjectId,
		ref: 'User',
	},
	createdAt: {
		type: Date,
		default: Date.now,
	},
});

module.exports = mongoose.model('Collections', collectionSchema);
