const router = require('express').Router();
const { isAuthenticated } = require('../middleware/auth');
const { createPost, likeUnlikePost, deletePost, sharePost, commentPost, timelinePosts, userPosts } = require('../controllers/post.controller');

router.route('/post/create').post(isAuthenticated, createPost);
router.route('/post/comment').post(isAuthenticated, commentPost);
router.route('/post/share').post(isAuthenticated, sharePost);
router.route('/post/like/:id').put(isAuthenticated, likeUnlikePost)
router.route('/post/timeline').get(isAuthenticated, timelinePosts);
router.route('/post/:id').delete(isAuthenticated, deletePost).get(isAuthenticated, userPosts);

module.exports = router;