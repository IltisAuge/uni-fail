import {PostModel} from '../schemata/schemata';
import dotenv from 'dotenv';
import NodeCache from 'node-cache';
import {IPost} from '../post.interface';

dotenv.config();

const postCache = new NodeCache();

export async function getPost(postId: string): Promise<IPost | undefined> {
    const cachedPost = postCache.get(postId) as IPost | undefined;
    if (cachedPost) {
        return cachedPost;
    }
    const post = await PostModel.findOne({ _id: postId }).exec();
    if (post) {
        postCache.set(postId, post);
        return post;
    }
    return undefined;
}

export async function createPost(userId: string, content: string, tags: string[]): Promise<IPost> {
    const date = new Date();
    const postId = crypto.randomUUID().toString();
    postCache.set(postId, {_id: postId, creationTime: date.toISOString(), userId, content, tags});
    const model = new PostModel({_id: postId, creationTime: date.toISOString(), userId, content, tags});
    try {
        return await model.save();
    } catch (error) {
        console.error('Could not save post:', error);
        return Promise.reject(error);
    }
}

export async function deletePost(postId: string) {
    postCache.del(postId);
    return PostModel.deleteOne({_id: postId});
}

export async function getNewestPosts(max: number) {
    return await PostModel.find({})
        .sort({ creationTime: -1 }) // Sort by creationTime descending (newest first)
        .limit(max)
        .exec();
}

export async function getUniRankingMostVotes(limit: number) {
    return PostModel.aggregate([
        // 1. Zerlege jeden Tag in einem Post zu einem einzelnen Dokument
        { $unwind: "$tags" },

        // 2. Optional: Filtere nur Uni-Tags (falls nötig)
        { $match: { tags: { $regex: /^uni:/i } } },

        // 3. Gruppiere nach Uni-Tag und summiere Upvotes
        {
            $group: {
                _id: "$tags",
                totalUpvotes: { $sum: "$upvotes" }
            }
        },

        // 4. Sortiere nach den meisten Upvotes
        { $sort: { totalUpvotes: -1 } },

        // 5. Begrenze auf die gewünschte Anzahl
        { $limit: limit }
    ]);
}
