import {model, Schema} from 'mongoose';
import {IUserDocument} from '../user.interface';
import {IPostDocument} from '../post.interface';

export interface PostType {
	_id: string;
	userId: string;
    creationTime: string;
	content: string;
	tags: string[];
}
const PostSchema = new Schema<IPostDocument>({
    _id: String,
    title: String,
    content: String,
    userId: String,
    creationTime: String,
    tags: [String],
});
export const PostModel = model<IPostDocument>('Post', PostSchema);

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
        default: [],
    },
});

export const DisplayNamesModel = model('DisplayNames', DisplayNamesSchema);

const TagsSchema = new Schema({
    _id: Number,
    tags: {
        type: [String],
        default: [],
    },
});

export const TagsModel = model('Tags', TagsSchema);
