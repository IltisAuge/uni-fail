import express from 'express';
import session from 'express-session';
import cors from 'cors';
import { Database } from './database';
import loginRoutes from './routes/login-routes';
import dotenv from 'dotenv';
dotenv.config();

declare module 'express-session' {
	interface SessionData {
		user?: {
			id: string;
			email: string;
			name: string;
		};
	}
}

const server = express();
server.use(express.json());
server.use(session({
	secret: process.env.SESSION_SECRET as string,
	resave: false,
	saveUninitialized: false,
	cookie: {
		secure: process.env.ENV === 'PRODUCTION',
		httpOnly: true
	}
}));
server.use(cors({
	origin: 'https://uni-fail.iltisauge.de',
	credentials: true
}));
server.use('/login', loginRoutes);

server.get('/', (req, res) => {
	res.header('Content-Type', 'text/plain');
	res.send('Welcome to the API of uni-fail!');
});

server.listen(5010, () => {
    console.log('Server listening on port 5010');
});

const db = new Database();
db.connect();
