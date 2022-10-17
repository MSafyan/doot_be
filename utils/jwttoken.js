const sendToken = (
	res,
	statusCode,
	message,
	user,
	token,
	domain = process.env.COOKIE_URL
) => {
	//cookie
	const options = {
		expires: new Date(Date.now() + 1000 * 60 * 60 * 24 * 360),
		httpOnly: true,
		secure: false,
		sameSite: 'lax',
	};

	res.cookie('token', token, {
		domain,
		path: '/',
		secure: false,
	});
	res.status(statusCode).cookie('token', token, options).json({
		status: statusCode,
		message,
		user,
		token,
	});
};

module.exports = sendToken;
