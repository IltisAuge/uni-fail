import {Router} from 'express';
import {GoogleLoginController} from '../login-providers/google-login';
import {MicrosoftLoginController} from '../login-providers/microsoft-login';
import {
    getRandomDisplayName,
    removeAvailableDisplayName,
    saveUser,
    setAvatarKey,
    setDisplayName
} from '../controller/user-controller';
import dotenv from 'dotenv';

dotenv.config();

const loginRouter = Router();
const googleLoginController = new GoogleLoginController();
const microsoftLoginController = new MicrosoftLoginController();

loginRouter.get('/', (req, res) => {
	let loginController: GoogleLoginController | MicrosoftLoginController;
	switch (req.query.provider) {
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

loginRouter.post('/microsoft-auth-return', (req, res) => {
	const id_token = req.body.id_token as string;
	if (id_token == undefined) {
		res.send('No id_token');
		return;
	}
	if (id_token.constructor !== String) {
		res.send('id_token is not a string');
		return;
	}
	const state = req.body.state;
	if (state == undefined) {
		res.send('No state');
		return;
	}
	if (req.session.oAuthState != state) {
		res.send('Invalid oAuthState');
		return;
	}
	const jwt = microsoftLoginController.decodeJWT(id_token);
	if (jwt.nonce != req.session.oAuthNonce) {
		res.send('Invalid oAuthNonce');
		return;
	}
	microsoftLoginController.getUserData(jwt).then(userData => completeAuthentication(userData, req, res));
});

loginRouter.get('/check-login', (req, res) => {
	res.json({user: req.session.user});
});

// Only enable this endpoint in development
if (process.env.PRODUCTION === 'false') {
    console.log("Enabled /login/mock endpoint")
    loginRouter.get('/mock', (req, res) => {
        const isAdmin = req.query.admin as unknown as boolean;
        req.session.user = {
            _id: '000000000',
            provider: 'mock-provider',
            name: 'Mock User',
            email: 'mock@user.de',
            isAdmin: isAdmin,
            displayName: 'Mock User Display Name',
            avatarKey: 'mockAvatar.jpg'
        }
        res.status(302).send("Mocked session with admin=" + isAdmin);
    });
} else {
    console.log("Not enabled /login/mock endpoint")
}

async function completeAuthentication(userData: any, req: any, res: any) {
    let userDocument = await saveUser(userData);
    if (userDocument) {
        if (!userDocument.avatarKey) {
            console.log("No avatarKey set");
            userDocument = await setAvatarKey(userDocument._id, '307ce493-b254-4b2d-8ba4-d12c080d6651.jpg');
            console.log("Default avatarKey set");
            console.log(userDocument);
        }
        if (!userDocument.displayName) {
            console.log("No displayName set");
            const randomDisplayName = getRandomDisplayName();
            console.log("setting random name: " + randomDisplayName);
            await removeAvailableDisplayName(randomDisplayName);
            userDocument = await setDisplayName(userDocument._id, randomDisplayName);
            console.log(userDocument);
        }
        req.session.user = userDocument;
        res.redirect(process.env.AUTH_RETURN_URL as string);
        return;
    }
    res.status(500).send('Authentication failed!');
}

export default loginRouter;
