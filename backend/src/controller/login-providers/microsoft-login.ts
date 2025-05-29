import {jwtDecode, JwtPayload} from 'jwt-decode';
import {LoginController} from './login-controller';

export interface MicrosoftIdToken extends JwtPayload {
	oid: string;
	name: string;
	email: string;
	nonce: string; // security parameter
}

export class MicrosoftLoginController extends LoginController {

	getAuthURL(): string {
		return this.formatURL('https://login.microsoftonline.com/{tenant}/oauth2/v2.0/authorize?\n' +
			'client_id={client_id}\n' +
			'&response_type=code%20id_token\n' +
			'&redirect_uri={return_uri}\n' +
			'&response_mode=form_post\n' +
			'&nonce={nonce}\n' +
			'&scope={scope}\n' +
			'&state={state}\n');
	}

	decodeJWT(id_token: string): MicrosoftIdToken {
		return jwtDecode<MicrosoftIdToken>(id_token);
	}

	async getUserData(decoded_token: MicrosoftIdToken): Promise<{
		provider: string;
		id: string;
		email: string;
		name: string;
	}> {
		return {
			provider: 'microsoft',
			id: decoded_token.oid,
			email: decoded_token.email,
			name: decoded_token.name
		};
	}

	private formatURL(url: string): string {
		return url.replace('{tenant}', process.env.MICROSOFT_TENANT_ID as string)
			.replace('{client_id}', process.env.MICROSOFT_CLIENT_ID as string)
			.replace('{return_uri}', process.env.MICROSOFT_RETURN_URL as string)
			.replace('{scope}', process.env.MICROSOFT_SCOPE as string);
	}
}
