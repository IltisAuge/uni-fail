import dotenv from 'dotenv';
import NodeCache from 'node-cache';
import {PostModel} from '../schemata/schemata';
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
        const plainPost = post.toObject() as IPost;
        postCache.set(postId, plainPost);
        return plainPost;
    }
    return undefined;
}

export async function createPost(userId: string, title: string, content: string, tags: string[]): Promise<IPost> {
    const date = new Date();
    const postId = crypto.randomUUID().toString();
    const postObject = {_id: postId, creationTime: date.toISOString(), userId, title, content, tags};
    postCache.set(postId, postObject);
    const model = new PostModel(postObject);
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
        .lean() //need to make sure object is consistent or else postcomponent does not work
        .exec();
}

/**
 *
 * @param limit
 * @return an array of universities with the most upvoted posts, limited by a given amount
 * The array contains objects with the following structure:
 * _id is the name of the university starting with 'uni:'
 * totalUpvotes is the sum of upvotes this university received on user posts
 */
export async function getUniRankingMostVotes(limit: number): Promise<{_id: string, totalUpvotes: number}[]> {
    return PostModel.aggregate([
        { $unwind: '$tags' },
        { $match: { tags: { $regex: /^uni:/i } } },
        {
            $group: {
                _id: '$tags',
                totalUpvotes: { $sum: '$upvotes' },
            },
        },
        { $sort: { totalUpvotes: -1 } },
        { $limit: limit },
    ]);
}
