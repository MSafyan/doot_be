const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const UserSchema = new mongoose.Schema(
	{
		fullname: {
			type: String,
			require: true,
			unique: true,
		},
		gender: String,
		avatar: String,
		coverUrl: String,
		followerss: [
			{
				type: mongoose.Schema.Types.ObjectId,
				ref: 'User',
			},
		],
		followingss: [
			{
				type: mongoose.Schema.Types.ObjectId,
				ref: 'User',
			},
		],
		posts: [
			{
				type: mongoose.Schema.Types.ObjectId,
				ref: 'Postss',
			},
		],
		notifications: [
			{
				id: {
					type: mongoose.Schema.Types.ObjectId,
					ref: 'Notifications',
				},
				seen: {
					type: Boolean,
					default: false,
				},
			},
		],
		email: {
			type: String,
			required: true,
			max: 50,
			unique: true,
		},
		password: {
			type: String,
			required: true,
			min: 6,
		},
		username: {
			type: String,
			require: true,
			min: 3,
			max: 20,
			unique: true,
		},

		socketId: {
			type: String,
		},

		profilePicture: {
			type: String,
			default: '',
		},
		coverPicture: {
			type: String,
			default: '',
		},
		followers: {
			type: Array,
			default: [],
		},
		followings: {
			type: Array,
			default: [],
		},
		isAdmin: {
			type: Boolean,
			default: false,
		},
		desc: {
			type: String,
			max: 50,
		},
		city: {
			type: String,
			max: 50,
		},
		from: {
			type: String,
			max: 50,
		},
		relationship: {
			type: Number,
			enum: [1, 2, 3],
		},
		profileImage: {
			type: String,
			default: '',
		},
	},
	{ timestamps: true }
);

UserSchema.pre('save', async function (next) {
	if (this.isModified('password')) {
		this.password = await bcrypt.hash(this.password, 10);
	}
	next();
});

UserSchema.methods.matchPassword = async function (password) {
	return await bcrypt.compare(password, this.password);
};

UserSchema.methods.generateToken = async function () {
	return jwt.sign({ _id: this._id }, process.env.JWT_SECRET, {
		expiresIn: process.env.JWT_EXPIRES_IN,
	});
};

module.exports = mongoose.model('User', UserSchema);
