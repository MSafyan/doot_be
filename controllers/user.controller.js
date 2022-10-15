const { saveImages, delImages } = require('../helper/image');
const User = require('../models/User');
const json = require('../utils/jsonresponse');
const sendToken = require('../utils/jwttoken');

// Register User
exports.register = async (req, res) => {
	try {
		const { fullname, email, password } = req.body;

		let user = await User.findOne({ email });
		if (user) return json(res, 409, 'Email already exists');

		const avatar = `${req.protocol}://${req.get(
			'host'
		)}/upload/avatar/default_profile.jpg`;
		const coverUrl = `${req.protocol}://${req.get(
			'host'
		)}/upload/cover/default_cover.jpg`;

		user = await User.create({
			fullname,
			username: fullname,
			email,
			password,
			avatar,
			coverUrl,
			gender: '',
		});
		json(res, 201, 'Registered successfully', user);
	} catch (error) {
		json(res, 500, error.message);
	}
};

// Login User
exports.login = async (req, res) => {
	console.log(req.body);
	try {
		const { email, password } = req.body;

		let user = await User.findOne({ email }).select('+password');
		if (!user) return json(res, 404, 'User not found');

		const isMatch = await user.matchPassword(password);
		if (!isMatch) return json(res, 404, 'Invalid Credentials');

		const token = await user.generateToken();
		sendToken(res, 200, 'Login successfully', user, token);
	} catch (error) {
		json(res, 500, error.message);
	}
};

// Logout User
exports.logout = async (req, res) => {
	res.clearCookie('token');
	json(res, 200, 'Logout successfully ');
};

// follow/unfollow a user
exports.followUnfollowUser = async (req, res) => {
	try {
		if (req.params.id.toString() === req.user._id.toString()) {
			return json(res, 403, 'Forbidden request');
		}

		const userToFollow = await User.findById(req.params.id);
		const loggedInUser = await User.findById(req.user._id);

		if (!userToFollow) return json(res, 404, 'User not found');

		if (!loggedInUser.followingss.includes(req.params.id)) {
			await userToFollow.updateOne({ $push: { followerss: req.user._id } });
			await loggedInUser.updateOne({ $push: { followingss: req.params.id } });
			return json(res, 200, 'User followed');
		} else {
			await userToFollow.updateOne({ $pull: { followerss: req.user._id } });
			await loggedInUser.updateOne({ $pull: { followingss: req.params.id } });
			return json(res, 200, 'User unFollowed');
		}
	} catch (error) {
		json(res, 500, error.message);
	}
};

// update user password
exports.updatePassword = async (req, res) => {
	try {
		const { oldPassword, newPassword } = req.body;
		const user = await User.findById(req.user._id).select('+password');

		const isMatch = await user.matchPassword(oldPassword);
		if (!isMatch) return json(res, 400, 'Incorrect old password');

		user.password = newPassword;
		await user.save();
		json(res, 200, 'Password Updated');
	} catch (error) {
		json(res, 500, error.message);
	}
};

// update user profile
exports.updateProfile = async (req, res) => {
	try {
		const user = await User.findById(req.user._id);

		const { email, fullname, gender } = req.body;
		let avatar;
		if (req.files?.image) {
			delImages(user.avatar, 'avatar');
			avatar = saveImages(req, 'avatar');
			await user.updateOne({ $set: { avatar } });
		}
		await user.updateOne({ $set: { email, fullname, gender } });
		json(res, 200, 'Profile Updated');
	} catch (error) {
		json(res, 500, error.message);
	}
};

// update user cover
exports.updateCover = async (req, res) => {
	try {
		if (!req.files) return json(res, 400, 'Profile cover required');

		let coverUrl;
		const user = await User.findById(req.user._id);

		delImages(user.coverUrl, 'cover');
		coverUrl = saveImages(req, 'cover');
		await user.updateOne({ $set: { coverUrl } });

		json(res, 200, 'Profile Cover Updated');
	} catch (error) {
		json(res, 500, error.message);
	}
};

// get me profile
exports.profileMe = async (req, res) => {
	try {
		console.log('profile me', req.user.id);
		const user = await User.findById(req.user._id).populate('posts');
		console.log('user', user);

		if (!user) return json(res, 404, 'User Not Found');
		json(res, 200, null, user);
	} catch (error) {
		json(res, 500, error.message);
	}
};

// when redirected from socials app to doot
exports.loginRedirect = async (req, res) => {
	try {
		console.log('profile me', req.user.id);
		const user = await User.findById(req.user._id);
		console.log('user', user);

		if (!user) return json(res, 404, 'User Not Found');
		res.status(200).json(user);
	} catch (error) {
		json(res, 500, error.message);
	}
};

// get user profile
exports.userProfile = async (req, res) => {
	try {
		const user = await User.findById(req.params.id)
			.populate('posts followerss followingss')
			.select('-notifications -stories');
		if (!user) return json(res, 404, 'User Not Found');
		json(res, 200, null, user);
	} catch (error) {
		json(res, 500, error.message);
	}
};

// get all users
exports.allUsers = async (req, res) => {
	try {
		const users = await User.find({
			_id: { $not: { $eq: req.user._id } },
		}).sort({ fullName: 1 });
		json(res, 200, null, users);
	} catch (error) {
		json(res, 500, error.message);
	}
};

// get active landers
exports.activeLanders = async (req, res) => {
	try {
		const followings = await User.findById(req.user._id).select('followingss');
		const users = await User.find({
			$and: [
				{ _id: { $not: { $in: followings.followingss } } },
				{ _id: { $not: { $in: req.user._id } } },
			],
		});
		json(res, 200, null, users);
	} catch (error) {
		json(res, 500, error.message);
	}
};
