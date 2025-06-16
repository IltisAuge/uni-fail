import {model, Schema} from "mongoose";
import {IUserDocument} from '../user.interface';

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

const UserSchema = new Schema<IUserDocument>({
    _id: String,
    provider: String,
    email: String,
    name: String,
    isAdmin: Boolean,
    displayName: String,
    avatarKey: String,
    isBlocked: Boolean,
}, {
    timestamps: true,
});

export const UserModel = model<IUserDocument>('User', UserSchema);

const DisplayNamesSchema = new Schema({
    _id: Number,
    names: {
        type: [String],
        default: []
    }
});

export const DisplayNamesModel = model('DisplayNames', DisplayNamesSchema);
