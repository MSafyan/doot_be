const { saveImages } = require('../helper/image');
const Story = require('../models/story');
const User = require('../models/User');
const json = require('../utils/jsonresponse');

// Create Story
exports.createStory = async (req, res) => {
	try {
		if (!req.files) return json(res, 500, 'Story image required');

		const newStoryData = {
			owner: req.user._id,
			imageUrl: req.files?.image,
			expiredAt: Date.now() + 1000 * 60 * 60 * 24 * 1,
		};
		if (newStoryData.imageUrl) {
			newStoryData.imageUrl = saveImages(req, 'story');
		}

		const story = await Story.create(newStoryData);
		json(res, 201, 'Story created successfully', story);
	} catch (error) {
		json(res, 500, error.message);
	}
};

// get Story Users
exports.getStoryUsers = async (req, res) => {
	try {
		// const story = await Story.aggregate([
		//     { $group: { _id: "$owner", stories: { $push: "$$ROOT" } } },
		// ])

		//get users whose stories exists
		const me = await User.findById(req.user._id);
		const stories = await Story.find({ expiredAt: { $gt: Date.now() } }).sort({
			createdAt: -1,
		});
		let usersFindArr = [];

		// if (me.stories.length > 0) { usersFindArr.push({ _id: req.user._id }) }

		for (let i = 0; i < stories.length; i++) {
			if (me._id.toString() === stories[i].owner.toString()) {
				usersFindArr.push(stories[i].owner);
				break;
			}
		}
		for (let i = 0; i < stories.length; i++) {
			for (let j = 0; j < me.followingss.length; j++) {
				if (me.followingss[j].toString() === stories[i].owner.toString()) {
					usersFindArr.push(stories[i].owner);
				}
			}
		}
		let users = await User.find({ _id: { $in: usersFindArr } }).select(
			'fullname avatar'
		);
		for (let i = 0; i < users.length; i++) {
			const stories = await Story.find({
				$and: [{ owner: users[i]._id }, { expiredAt: { $gt: Date.now() } }],
			}).sort({ createdAt: -1 });
			users[i].stories = stories;
		}
		json(res, 200, null, users);
	} catch (error) {
		json(res, 500, error.message);
	}
};

// get All Stories
exports.getAllStories = async (req, res) => {
	try {
		const stories = await Story.find({ expiredAt: { $gt: Date.now() } }).sort({
			createdAt: -1,
		});
		json(res, 200, null, stories);
	} catch (error) {
		json(res, 500, error.message);
	}
};
