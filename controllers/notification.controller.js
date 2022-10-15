const User = require('../models/User');
const Notification = require('../models/notification');
const json = require('../utils/jsonresponse');

// create a new Notification for single user
exports.createNotification = async (req, res) => {
	try {
		const user = await User.findById(req.body.toId);
		const sendBy = await User.findById(req.user._id);
		if (!user) return json(res, 404, 'User not found');
		if (req.user._id.toString() === req.body.toId.toString())
			return json(res, 202, "Can't Send Notification");

		let data = {
			notification: `${sendBy.fullname} ${req.body.notification}`,
			senderId: req.user._id,
			senderAvatar: sendBy.avatar,
		};
		const notification = await Notification.create(data);
		await user.updateOne({
			$push: { notifications: { id: notification._id } },
		});

		json(res, 201, null, notification);
	} catch (error) {
		json(res, 500, error.message);
	}
};

// create new Notifications for following users
exports.createNotifications = async (req, res) => {
	try {
		const user = await User.findById(req.user._id);
		if (!user) return json(res, 404, 'User not found');

		let data = {
			notification: `${user.fullname} ${req.body.notification}`,
			senderId: req.user._id,
			senderAvatar: user.avatar,
		};

		const notification = await Notification.create(data);
		for (let i = 0; i < user.followerss.length; i++) {
			const follower = await User.findById(user.followerss[i]);
			await follower.updateOne({
				$push: { notifications: { id: notification._id } },
			});
		}
		json(res, 201, 'Notification sent', notification);
	} catch (error) {
		json(res, 500, error.message);
	}
};

// get all notifications
exports.getUserNotifications = async (req, res) => {
	try {
		const user = await User.findById(req.user._id).populate('notifications.id');
		if (!user) return json(res, 404, 'User Not found');

		let unSeenCount = 0;
		user.notifications.map((item) => {
			if (item.seen === false) {
				unSeenCount++;
			}
		});

		user.notifications = user.notifications.sort(
			(a, b) => b.id.createdAt - a.id.createdAt
		);
		let data = {
			unSeen: unSeenCount,
			data: user.notifications,
		};
		json(res, 200, null, data);
	} catch (error) {
		json(res, 500, error.message);
	}
};

// mark as seen
exports.markAsSeen = async (req, res) => {
	try {
		const user = await User.findById(req.user._id).select('notifications');
		if (!user) return json(res, 404, 'User Not found');
		user.notifications.map((item) => {
			item.seen = true;
		});
		await user.save();
		json(res, 200, 'Notifications seen');
	} catch (error) {
		json(res, 500, error.message);
	}
};
