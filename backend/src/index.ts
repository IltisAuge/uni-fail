import express from 'express';
import session from 'express-session';
import cors from 'cors';
import {Database} from './database';
import loginRoutes from './routes/login-routes';
import dotenv from 'dotenv';

dotenv.config();

declare module 'express-session' {
	interface SessionData {
		user?: {
			id: string;
			email: string;
			name: string;
		},
		oAuthState: string;
		oAuthNonce: string;
	}
}

const server = express();
server.set('trust proxy', 1);
server.use(express.json());
server.use(express.urlencoded({extended: true}));
server.use(session({
	secret: process.env.SESSION_SECRET as string,
	resave: false,
	saveUninitialized: false,
	proxy: true,
	cookie: {
		secure: true,
		httpOnly: true,
		sameSite: 'none',
		domain: '.uni-fail.iltisauge.de'
	}
}));
server.use(cors({
	origin: process.env.HOST,
	credentials: true
}));
server.use((req, res, next) => {
	console.log('Session:', JSON.stringify(req.session, null, 2));
	next();
})
server.use('/login', loginRoutes);

server.get('/', (req, res) => {
	res.header('Content-Type', 'text/plain');
	res.send('Welcome to the API of uni-fail!');
});

server.listen(5010, () => {
	console.log("Starting in " + (process.env.PRODUCTION === 'true' ? 'PRODUCTION':'DEVELOPMENT') + " mode");
	console.log('Server listening on port 5010');
});

const db = new Database();
//db.connect();
