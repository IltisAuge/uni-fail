import {UserModel} from '../schemata/schemata';

export class UserController {

	async saveUser(userData: { _id: string, provider: string, name: string, email: string }) {
        const res = await UserModel.findOneAndUpdate(
			{_id: userData._id},
			{$set: userData},
			{
				upsert: true,
				new: true,  // return new/updated document
				setDefaultsOnInsert: true
			}
		);
		console.log(res);
		return res;
	}

	async setAdmin(_id: string, status: boolean) {
		return UserModel.findOneAndUpdate(
			{_id: _id},
			{$set: {isAdmin: status}},
			{
				new: true,  // return new/updated document
				setDefaultsOnInsert: true
			}
		)
	}
}
