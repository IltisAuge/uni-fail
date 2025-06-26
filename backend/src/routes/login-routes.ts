import {Router} from 'express';
import {GoogleLoginController} from '../login-providers/google-login';
import {MicrosoftLoginController} from '../login-providers/microsoft-login';
import {getRandomDisplayName, getUser, saveUser} from '../controller/user-controller';
import dotenv from 'dotenv';

dotenv.config();

const loginRouter = Router();
const googleLoginController = new GoogleLoginController();
const microsoftLoginController = new MicrosoftLoginController();

loginRouter.get('/', (req, res) => {
	let loginController: GoogleLoginController | MicrosoftLoginController;
	switch (String(req.query.provider).toLowerCase()) {
		case 'google':
			loginController = googleLoginController;
			break;
		case 'microsoft':
			loginController = microsoftLoginController;
			break;
		default:
			res.status(400).send('Invalid login provider');
			return;
	}
	let url = loginController.getAuthURL();
	const state = crypto.randomUUID().toString();
	const nonce = crypto.randomUUID().toString();
	// Replace security parameters for Microsoft
	url = url.replace('{state}', state).replace('{nonce}', nonce);
	req.session.oAuthState = state;
	req.session.oAuthNonce = nonce;
	res.redirect(url);
});

loginRouter.get('/google-auth-return', (req, res) => {
	const code = req.query.code;
	if (code == undefined) {
		res.send('No code');
		return;
	}
	if (!(code.constructor === String)) {
		res.send('Code is not a string');
		return;
	}
	googleLoginController.getUserData(code).then(userData => completeAuthentication(userData, req, res));
});

loginRouter.get('/microsoft-auth-return', (req, res) => {
	const authCode = req.query.code as string;
	if (authCode == undefined) {
		res.send('No authCode');
		return;
	}
	if (authCode.constructor !== String) {
		res.send('authCode is not a string');
		return;
	}
	const state = req.query.state;
	if (state == undefined) {
		res.send('No state');
		return;
	}
	if (req.session.oAuthState != state) {
		res.send('Invalid oAuthState');
		return;
	}
    microsoftLoginController.requestIdToken(authCode).then((jwt) => {
        if (!jwt) {
            res.send('JWT invalid');
            return;
        }
        if (jwt.nonce != req.session.oAuthNonce) {
            res.send('Invalid oAuthNonce');
            return;
        }
        microsoftLoginController.getUserData(jwt).then(userData => completeAuthentication(userData, req, res));
    })
});

// Only enable this endpoint in development
if (process.env.PRODUCTION === 'false') {
    console.log("Enabled /login/mock endpoint")
    loginRouter.get('/mock', (req, res) => {
        const isAdmin = req.query.admin as string;
        req.session.userId = '000000000';
        res.status(302).send("Mocked session with admin=" + isAdmin);
    });
} else {
    console.log("Not enabled /login/mock endpoint")
}

async function completeAuthentication(userData: any, req: any, res: any) {
    let user = await getUser(userData._id);
    if (!user) {
        // User does not yet exist in the database
        // Set default avatar and random display name
        const avatarId = '307ce493-b254-4b2d-8ba4-d12c080d6651.jpg';
        const randomDisplayName = getRandomDisplayName();
        user = {
            _id: userData._id,
            provider: userData.provider,
            email: userData.email,
            name: userData.name,
            isAdmin: false,
            displayName: randomDisplayName,
            avatarKey: avatarId,
            isBlocked: false
        };
        if (!await saveUser(user)) {
            res.status(500).send('Saving user failed!');
            return;
        }
    }
    req.session.userId = user._id;
    res.redirect(process.env.AUTH_RETURN_URL as string);
}

export default loginRouter;
