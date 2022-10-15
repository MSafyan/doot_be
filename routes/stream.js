const router = require('express').Router();
const { isAuthenticated } = require('../middleware/auth');
const {
	createStream,
	getStreams,
	deleteStream,
} = require('../controllers/stream.controller');

router.route('/stream/create').post(isAuthenticated, createStream);
router.route('/stream/all').get(isAuthenticated, getStreams);
router.route('/stream').delete(isAuthenticated, deleteStream);

module.exports = router;
