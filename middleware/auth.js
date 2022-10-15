const jwt = require('jsonwebtoken');
const User = require('../models/User');
const json = require('../utils/jsonresponse');

exports.isAuthenticated = async (req, res, next) => {
	var { token } = req.cookies;
	if (!token) {
		if (
			req.headers.authorization &&
			req.headers.authorization.startsWith('Bearer')
		) {
			token = req.headers.authorization.split(' ')[1];
		}
		if (!token) return json(res, 403, `Forbidden request.`);
	}

	const decode = jwt.verify(token, process.env.JWT_SECRET);
	req.user = await User.findById(decode._id);

	next();
};
