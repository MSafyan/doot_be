const mongoose = require('mongoose');
const { saveImages, saveVideos, delImages } = require('../helper/image');
const Post = require('../models/postss');
const User = require('../models/User');
const json = require('../utils/jsonresponse');

// Create Post
exports.createPost = async (req, res) => {
	console.log(req.body);
	try {
		const newPostData = {
			description: req.body.description,
			owner: req.user._id,
			imageUrl: req.files?.image,
			videoUrl: req.files?.video,
		};
		if (newPostData.imageUrl) {
			newPostData.imageUrl = saveImages(req, 'post');
		}
		if (newPostData.videoUrl) {
			newPostData.videoUrl = saveVideos(req, 'post');
		}

		const post = await Post.create(newPostData);
		const user = await User.findById(req.user._id);
		await user.updateOne({ $push: { posts: post._id } });

		json(res, 201, 'Post created successfully', post);
	} catch (error) {
		json(res, 500, error.message);
	}
};

// Delete post
exports.deletePost = async (req, res) => {
	try {
		const post = await Post.findById(req.params.id);
		if (!post) return json(res, 404, 'Post not Found');

		if (post.owner.toString() !== req.user._id.toString()) {
			return json(res, 401, 'Unauthorized');
		}
		if (post.imageUrl) {
			delImages(post.imageUrl, 'post');
		}
		if (post.videoUrl) {
			delImages(post.videoUrl, 'post');
		}
		await post.deleteOne();

		const user = await User.findById(req.user._id);
		await user.updateOne({ $pull: { posts: req.params.id } });
		json(res, 200, 'Post deleted successfully');
	} catch (error) {
		json(res, 500, error.message);
	}
};

// like and unlike the post
exports.likeUnlikePost = async (req, res) => {
	try {
		const post = await Post.findById(req.params.id);
		if (!post) return json(res, 404, 'Post not Found');

		if (!post.likes.includes(req.user._id)) {
			await post.updateOne({ $push: { likes: req.user._id } });
			json(res, 200, 'Post Liked');
		} else {
			await post.updateOne({ $pull: { likes: req.user._id } });
			json(res, 200, 'Post Unliked');
		}
	} catch (error) {
		json(res, 500, error.message);
	}
};

// Share post
exports.sharePost = async (req, res) => {
	try {
		const isPost = await Post.findById(req.body.postId);
		if (!isPost) return json(res, 404, 'Post not Found');

		const user = await User.findById(req.user._id);
		// if (user.posts.includes(req.body.postId)) return json(res, 409, "Post already shared")

		const postData = {
			description: isPost.description,
			owner: req.user._id,
			imageUrl: req.files?.image,
			videoUrl: req.files?.video,
			share: { user: isPost.owner, isShare: true },
		};

		if (postData.imageUrl) {
			postData.imageUrl = saveImages(req, 'post');
		}
		if (postData.videoUrl) {
			postData.videoUrl = saveVideos(req, 'post');
		}

		const post = await Post.create(postData);
		await isPost.updateOne({ $inc: { 'share.shareCount': 1 } });
		await user.updateOne({ $push: { posts: post._id } });

		json(res, 201, 'Post shared successfully', post);
	} catch (error) {
		json(res, 500, error.message);
	}
};

// comment on  post
exports.commentPost = async (req, res) => {
	try {
		const { postId, comment } = req.body;

		if (!mongoose.Types.ObjectId.isValid(postId))
			return json(res, 404, 'Post not Found');
		const post = await Post.findById(postId);
		if (!post) return json(res, 404, 'Post not Found');

		await post.updateOne({
			$push: { comments: { comment, user: req.user._id } },
		});
		json(res, 201, 'Comment added successfully');
	} catch (error) {
		json(res, 500, error.message);
	}
};

// get timeline
exports.timelinePosts = async (req, res) => {
	try {
		const user = await User.findById(req.user._id);
		let users = [...user.followingss, req.user._id];

		// let posts = await Post.find({ owner: { $in: users } }).populate(
		// 	'owner comments.user share.user'
		// );
		let posts = await Post.find().populate('owner comments.user share.user');
		posts = posts.sort((a, b) => b.createdAt - a.createdAt);
		json(res, 200, null, posts);
	} catch (error) {
		json(res, 500, error.message);
	}
};

// get User Posts
exports.userPosts = async (req, res) => {
	try {
		let posts = await Post.find({ owner: { $in: req.params.id } }).populate(
			'owner comments.user share.user'
		);
		posts = posts.sort((a, b) => b.createdAt - a.createdAt);
		json(res, 200, null, posts);
	} catch (error) {
		json(res, 500, error.message);
	}
};
