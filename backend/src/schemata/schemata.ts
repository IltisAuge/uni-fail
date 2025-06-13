import {Schema, model} from "mongoose";

export interface PostType {
	_id: string;
	userId: string;
    creationTime: string;
	content: string;
	tags: string[];
}
const PostSchema = new Schema<PostType>({
	_id: String,
	userId: String,
    creationTime: String,
	content: String,
	tags: [String]
});
export const PostModel = model('Post', PostSchema);

const UserSchema = new Schema({
	_id: String,
	provider: String,
	email: String,
    name: String,
	isAdmin: {
		type: Boolean,
		default: false,
		required: true
	},
    displayName: String,
    avatarKey: String
});
export const UserModel = model('User', UserSchema);

const DisplayNamesSchema = new Schema({
    _id: Number,
    names: {
        type: [String],
        default: []
    }
});

export const DisplayNamesModel = model('DisplayNames', DisplayNamesSchema);
