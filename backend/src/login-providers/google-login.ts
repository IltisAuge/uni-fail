import {OAuth2Client} from 'google-auth-library';
import {LoginController} from '../controller/login-controller';
import keys from '../../google_client.json';

export class GoogleLoginController extends LoginController {

    getAuthURL() {
        return this.getClient().generateAuthUrl({
            access_type: 'offline',
            scope: [
                'https://www.googleapis.com/auth/userinfo.profile',
                'https://www.googleapis.com/auth/userinfo.email',
            ],
        });
    }

    async getUserData(code: string) {
        const response = await this.getClient().getToken(code);
        const idToken = response.tokens.id_token;
        if (idToken == undefined) {
            throw new Error('No id token');
        }
        const decodedToken = this.decodeToken(idToken);
        const payload = decodedToken.payload;
        return {
            _id: payload.sub,
            provider: 'Google',
            email: payload.email,
            name: payload.name,
        };
    }

    private getClient() {
        return new OAuth2Client(
            keys.web.client_id,
            keys.web.client_secret,
            keys.web.redirect_uris[0],
        );
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
            header,
            payload,
            signature: signatureSeg,
        };
    }

    private base64urlDecode(str: string) {
        return Buffer.from(this.base64urlUnescape(str), 'base64').toString();
    }

    private base64urlUnescape(str: string) {
        str += Array(5 - str.length % 4).join('=');
        return str.replace(/-/g, '+').replace(/_/g, '/');
    }
}
