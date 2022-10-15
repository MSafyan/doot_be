const express = require('express');
const cors = require('cors');
const fileUpload = require('express-fileupload');
const cookieParser = require('cookie-parser');
const error = require('../middleware/error');
const user = require('../routes/user');
const post = require('../routes/post');
const story = require('../routes/story');
const nft = require('../routes/nft');
const notification = require('../routes/notification');
const stream = require('../routes/stream');

module.exports = function (server) {
	server.use(
		cors({
			methods: ['GET', 'POST', 'DELETE', 'UPDATE', 'PUT', 'PATCH'],
			origin: '*',
		})
	);
	server.use(express.json({ limit: '50mb' }));
	server.use(express.urlencoded({ limit: '50mb', extended: true }));
	server.use(express.static('public'));
	server.use('/upload', express.static(__dirname + '/public'));
	server.use(fileUpload({ useTempFiles: false, tempFileDir: 'public' }));
	server.use(cookieParser());
	server.use('/api/v1', user);
	server.use('/api/v1', post);
	server.use('/api/v1', story);
	server.use('/api/v1', nft);
	server.use('/api/v1', notification);
	server.use('/api/v1', stream);
	server.use(error);
};
