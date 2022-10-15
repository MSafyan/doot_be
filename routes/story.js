const router = require('express').Router();
const { isAuthenticated } = require('../middleware/auth');
const { createStory, getStoryUsers, getAllStories } = require('../controllers/story.controller');

router.route('/story/create').post(isAuthenticated, createStory);
router.route('/story/users').get(isAuthenticated, getStoryUsers);
router.route('/story/all').get(isAuthenticated, getAllStories);

module.exports = router;