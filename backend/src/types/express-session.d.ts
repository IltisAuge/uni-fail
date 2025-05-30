import 'express-session';

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
