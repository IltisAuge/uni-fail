import {SessionData} from 'express-session';
import {MicrosoftIdToken} from '../login-providers/microsoft-login';

export abstract class LoginController {
	abstract getAuthURL(_session?: SessionData): string;

	abstract getUserData(_code: string | MicrosoftIdToken): Promise<{
        _id: string;
		provider: string;
		email: string;
		name: string;
	}>;
}
