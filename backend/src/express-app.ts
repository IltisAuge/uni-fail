import express from 'express';
import session from 'express-session';
import cors from 'cors';
import loginRoutes from './routes/login-routes';
import postRoutes from './routes/post-routes';
import dotenv from 'dotenv';

dotenv.config();

declare module 'express-session' {
	interface SessionData {
		user?: {
			_id: string;
			provider: string;
			email: string;
			name: string;
			isAdmin: boolean;
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
		secure: process.env.PRODUCTION == 'true',
		httpOnly: true,
		sameSite: process.env.PRODUCTION == 'true' ? 'none' : undefined,
		domain: process.env.PRODUCTION == 'true' ? '.' + process.env.DOMAIN : undefined
	}
}));
server.use(cors({
	origin: process.env.HOST,
	credentials: true
}));
server.use('/login', loginRoutes);
server.use('/post', postRoutes);
server.post('/logout', (req, res) => {
    req.session.user = undefined;
    res.status(200).send("Logout successful");
});

server.get('/', (req, res) => {
	res.header('Content-Type', 'text/plain');
	res.send('Welcome to the API of uni-fail!');
});

export default server;
