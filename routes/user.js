const router = require('express').Router();
const {
	register,
	login,
	followUnfollowUser,
	logout,
	updatePassword,
	updateProfile,
	userProfile,
	profileMe,
	allUsers,
	activeLanders,
	updateCover,
	loginRedirect,
} = require('../controllers/user.controller');
const { isAuthenticated } = require('../middleware/auth');

router.route('/user/register').post(register);
router.route('/user/login').post(login);
router.route('/user/logout').get(logout);
router.route('/user/follow/:id').put(isAuthenticated, followUnfollowUser);
router.route('/user/update/password').put(isAuthenticated, updatePassword);
router.route('/user/update/profile').put(isAuthenticated, updateProfile);
router.route('/user/update/cover').put(isAuthenticated, updateCover);
router.route('/user/profile/me').get(isAuthenticated, profileMe);
router.route('/user/loginRedirect/me').get(isAuthenticated, loginRedirect);
router.route('/user/profile/:id').get(isAuthenticated, userProfile);
router.route('/user/all').get(isAuthenticated, allUsers);
router.route('/user/landers').get(isAuthenticated, activeLanders);

module.exports = router;
