const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

const userSchema = mongoose.Schema({
	fullName: {
		type: String,
		required: true,
		trim: true,
	},
	email: {
		type: String,
		required: true,
		unique: true,
		trim: true,
	},
	password: {
		type: String,
		trim: true,
		required: true,
		select: false,
	},
	gender: String,
	avatar: String,
	coverUrl: String,
	followers: [
		{
			type: mongoose.Schema.Types.ObjectId,
			ref: 'Users',
		},
	],
	followings: [
		{
			type: mongoose.Schema.Types.ObjectId,
			ref: 'Users',
		},
	],
	posts: [
		{
			type: mongoose.Schema.Types.ObjectId,
			ref: 'Posts',
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
});

userSchema.pre('save', async function (next) {
	if (this.isModified('password')) {
		this.password = await bcrypt.hash(this.password, 10);
	}
	next();
});

userSchema.methods.matchPassword = async function (password) {
	return await bcrypt.compare(password, this.password);
};

userSchema.methods.generateToken = async function () {
	return jwt.sign({ _id: this._id }, process.env.JWT_SECRET, {
		expiresIn: process.env.JWT_EXPIRES_IN,
	});
};

module.exports = mongoose.model('Userss', userSchema);
