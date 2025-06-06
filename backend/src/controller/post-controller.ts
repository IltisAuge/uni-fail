import {PostModel, PostType} from '../schemata/schemata';
import {HydratedDocument} from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

export class PostController {

	async createPost(userId: string, content: string, tags: string[]): Promise<HydratedDocument<PostType>> {
        const date = new Date();
		const model = new PostModel({_id: crypto.randomUUID().toString(), creationTime: date.toISOString(), userId, content, tags});
		try {
			return await model.save();
		} catch (error) {
			console.error('Could not save post:', error);
			return Promise.reject(error);
		}
	}

    async getNewestPosts(max: number) {
        return await PostModel.find({})
            .sort({ creationTime: -1 }) // Sort by creationTime descending (newest first)
            .limit(max)
            .exec();
    }
}
