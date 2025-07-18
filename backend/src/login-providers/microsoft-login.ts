import {jwtDecode, JwtPayload} from 'jwt-decode';
import {LoginController} from '@/controllers/login-controller';
import {UserData} from '@/interfaces/userdata.interface';

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
			'&response_type=code\n' +
			'&redirect_uri={return_uri}\n' +
			'&nonce={nonce}\n' +
			'&scope={scope}\n' +
			'&state={state}\n');
    }

    async requestIdToken(authCode: string): Promise<MicrosoftIdToken | undefined> {
        const tokenURL = this.formatURL('https://login.microsoftonline.com/{tenant}/oauth2/v2.0/token');
        const response = await fetch(tokenURL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
            },
            body: new URLSearchParams({
                grant_type: 'authorization_code',
                code: authCode,
                redirect_uri: process.env.MICROSOFT_RETURN_URL as string,
                client_id: process.env.MICROSOFT_CLIENT_ID as string,
                client_secret: process.env.MICROSOFT_CLIENT_SECRET as string,
            }),
        });
        const data = await response.json();
        if (!data.id_token) {
            return undefined;
        }
        return this.decodeJWT(data.id_token);
    }

    decodeJWT(id_token: string): MicrosoftIdToken {
        return jwtDecode<MicrosoftIdToken>(id_token);
    }

    async getUserData(decoded_token: MicrosoftIdToken): Promise<UserData> {
        return {
            provider: 'Microsoft',
            _id: decoded_token.oid,
            email: decoded_token.email,
            name: decoded_token.name,
        };
    }

    private formatURL(url: string): string {
        return url.replace('{tenant}', process.env.MICROSOFT_TENANT_ID as string)
            .replace('{client_id}', process.env.MICROSOFT_CLIENT_ID as string)
            .replace('{return_uri}', process.env.MICROSOFT_RETURN_URL as string)
            .replace('{scope}', process.env.MICROSOFT_SCOPE as string);
    }
}
