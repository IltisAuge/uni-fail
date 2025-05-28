import {OAuth2Client} from 'google-auth-library';
import {generateRandomString} from 'ts-randomstring/lib';
import fetch from 'node-fetch';

export class LoginController {
	keys = require('../../google_client.json');

	private formatURL(url: string) {
		return url.replace('{app-id}', process.env.FACEBOOK_CLIENT_ID as string)
			.replace('{redirect-uri}', process.env.FACEBOOK_REDIRECT as string)
			.replace('{app-secret}', process.env.FACEBOOK_SECRET as string);
	}

	getAuthUrl(provider: string) {
		return this.formatURL('https://www.facebook.com/v22.0/dialog/oauth?\n' +
			'  client_id={app-id}\n' +
			'  &redirect_uri={redirect-uri}\n' +
			'  &state=' + generateRandomString({length: 32}) + '\n' +
			'  &responseType=code\n' +
			'  &scope=email,public_profile');
	}

	async getToken(code: string) {
		const token_url = this.formatURL('https://graph.facebook.com/v22.0/oauth/access_token?\n' +
			'   client_id={app-id}\n' +
			'   &redirect_uri={redirect-uri}\n' +
			'   &client_secret={app-secret}\n' +
			'   &code=' + code);
		return fetch(token_url, {method: 'GET'})
			.then(res => res.text())
			.then(text => JSON.parse(text.slice(1)))
			.then(json => {
				const access_token: string = json.access_token;
				console.log(access_token);
				if (access_token == undefined) {
					throw new Error('No access token');
				}
				return access_token;
			});
	}

	getMeEndpoint() {
		const token = this.getToken()
		return this.formatURL('https://graph.facebook.com/v22.0/me?fields=id,name,email,picture&access_token=' + token);
	}

	private decodeToken(token: string) {
		const segments = token.split('.');
		if (segments.length !== 3) {
			throw new Error('Not enough or too many segments');
		}
		// All segments should be base64
		const headerSeg = segments[0];
		const payloadSeg = segments[1];
		const signatureSeg = segments[2];
		const header = JSON.parse(this.base64urlDecode(headerSeg));
		const payload = JSON.parse(this.base64urlDecode(payloadSeg));
		return {
			header: header,
			payload: payload,
			signature: signatureSeg
		}
	}

	private base64urlDecode(str: string) {
		return Buffer.from(this.base64urlUnescape(str), 'base64').toString();
	}

	private base64urlUnescape(str: string) {
		str += Array(5 - str.length % 4).join('=');
		return str.replace(/-/g, '+').replace(/_/g, '/');
	}
}
