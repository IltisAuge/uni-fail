export abstract class LoginController {
	abstract getAuthURL(): string;
	abstract getUserData(code: string): Promise<{provider: string; id: string; email: string; name: string}>;
}
