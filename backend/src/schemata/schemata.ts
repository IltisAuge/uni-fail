import {Schema, model} from "mongoose";

export interface PostType {
	_id: string;
	userId: string;
	content: string;
	tags: string[];
}
const PostSchema = new Schema<PostType>({
	_id: String,
	userId: String,
	content: String,
	tags: [String]
});
export const PostModel = model('Post', PostSchema);

const UserSchema = new Schema({
	_id: String,
	provider: String,
	isAdmin: Boolean
});
export const UserModel = model('User', UserSchema);
