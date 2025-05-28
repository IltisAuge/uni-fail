import {generateRandomString} from 'ts-randomstring/lib';
import {jwtDecode, JwtPayload} from 'jwt-decode';
import {LoginController} from './login-controller';

interface MicrosoftIdToken extends JwtPayload {
	oid: string;
	name: string;
	email: string;
}

export class MicrosoftLoginController extends LoginController {

	private formatURL(url: string) {
		return url.replace('{tenant}', process.env.MICROSOFT_TENANT_ID as string)
			.replace('{client_id}', process.env.MICROSOFT_CLIENT_ID as string)
			.replace('{return_uri}', process.env.MICROSOFT_RETURN_URL as string)
			.replace('{scope}', process.env.MICROSOFT_SCOPE as string)
			.replace('{state}', generateRandomString({length: 32}) as string)
			.replace('{nonce}', generateRandomString({length: 32}) as string);
	}

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

	async getUserData(id_token: string) {
		const decodedToken = jwtDecode<MicrosoftIdToken>(id_token);
		return {
			provider: 'microsoft',
			id: decodedToken.oid,
			email: decodedToken.email,
			name: decodedToken.name
		};
	}
}
