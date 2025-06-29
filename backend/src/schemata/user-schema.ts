import {model, Schema} from 'mongoose';
import {UserDocument} from '@/interfaces/user.interface';

const UserSchema = new Schema<UserDocument>({
    _id: String,
    provider: String,
    email: String,
    name: String,
    isAdmin: Boolean,
    displayName: String,
    avatarKey: String,
    isBlocked: Boolean,
    votedPosts: [String],
}, {
    timestamps: true,
});

export const UserModel = model<UserDocument>('User', UserSchema);
