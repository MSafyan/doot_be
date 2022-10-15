const express = require('express');
const app = express();
const httpServer = require('http').Server(app);
const cors = require('cors');
const { instrument } = require('@socket.io/admin-ui');
const winston = require('winston');

app.use(
	cors({
		origin: [
			'http://localhost:3000',
			'http://localhost:3001',
			'https://dootbe.herokuapp.com',
			'https://socialfe.vercel.app',
			'https://dootfe.vercel.app',
		],
	})
);

const io = require('socket.io')(httpServer, {
	cors: {
		origin: [
			'http://localhost:3000',
			'http://localhost:3001',
			'https://admin.socket.io',
			'https://dootbe.herokuapp.com',
			'https://socialfe.vercel.app',
			'https://dootfe.vercel.app',
		],
		methods: '*',
		credentials: true,
	},
});
const helmet = require('helmet');
const morgan = require('morgan');
const mongoose = require('mongoose');
const dotenv = require('dotenv');

const userRoute = require('./routes/users');
const authRoute = require('./routes/auth');
const postRoute = require('./routes/posts');
const conversationRoute = require('./routes/conversations');
const messageRoute = require('./routes/messages');
const channelRoute = require('./routes/channels');
const ConnectionSocket = require('./services/ConnectionSocket');

dotenv.config();

//middleware
app.use(express.json());
app.use(
	helmet({
		crossOriginEmbedderPolicy: false,
	})
);
app.use(morgan('common'));

mongoose
	.connect(process.env.DATABASE, {
		useNewUrlParser: true,
	})
	.then(() => console.log('DB connection successful!'));

require('./start/logging')();
require('./start/routes')(app);
require('./cronjob')();

// app.use(express.static('public'));
app.use('/api/auth', authRoute);
app.use('/api/users', userRoute);
app.use('/api/posts', postRoute);
app.use('/api/conversations', conversationRoute);
app.use('/api/messages', messageRoute);
app.use('/api/channels', channelRoute);

io.on('connection', ConnectionSocket(io));

app.set('io', io);

const port = process.env.PORT || 8000;
const server = httpServer.listen(port, () => {
	winston.info(`Server is working on http://localhost:${port}`);
});

instrument(io, { auth: false });
process.on('unhandledRejection', (err) => {
	console.log('UNHANDLED REJECTION! 💥 Shutting down...');
	console.log(err.name, err.message);
	// server.close(() => {
	// 	process.exit(1);
	// });
});

process.on('SIGTERM', () => {
	console.log('👋 SIGTERM RECEIVED. Shutting down gracefully');
	server.close(() => {
		console.log('💥 Process terminated!');
	});
});
