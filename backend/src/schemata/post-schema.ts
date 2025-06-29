import {model, Schema} from 'mongoose';
import {PostDocument} from '@/interfaces/post.interface';

const PostSchema = new Schema<PostDocument>({
    _id: String,
    title: String,
    content: String,
    userId: String,
    tags: [String],
    upVotes: Number,
}, {
    timestamps: true,
});

export const PostModel = model<PostDocument>('Post', PostSchema);
