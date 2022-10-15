const router = require('express').Router();
const { createNotification, getUserNotifications, markAsSeen, createNotifications } = require('../controllers/notification.controller');
const { isAuthenticated } = require('../middleware/auth');

router.route('/notification/single').post(isAuthenticated, createNotification);
router.route('/notification/all').post(isAuthenticated, createNotifications);
router.route('/notification/user').get(isAuthenticated, getUserNotifications);
router.route('/notification/seen').get(isAuthenticated, markAsSeen);

module.exports = router;