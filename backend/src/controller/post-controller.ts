import {PostModel, PostType} from '../schemata/schemata';
import {HydratedDocument} from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

export class PostController {

	async createPost(userId: string, content: string, tags: string[]): Promise<HydratedDocument<PostType>> {
		const model = new PostModel({_id: crypto.randomUUID().toString(), userId, content, tags});
		try {
			return await model.save();
		} catch (error) {
			console.error('Could not save post:', error);
			return Promise.reject(error);
		}
	}
}
