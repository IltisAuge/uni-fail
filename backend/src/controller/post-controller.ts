import dotenv from 'dotenv';
import NodeCache from 'node-cache';
import {PostModel} from '@/schemata/post-schema';
import {Post} from '@/interfaces/post.interface';

dotenv.config();

const postCache = new NodeCache();

export async function getPost(postId: string): Promise<Post | undefined> {
    const cachedPost = postCache.get(postId) as Post | undefined;
    if (cachedPost) {
        return cachedPost;
    }
    const post = await PostModel.findOne({ _id: postId }).lean().exec();
    if (post) {
        postCache.set(postId, post);
        return post;
    }
    return undefined;
}

export async function createPost(userId: string, title: string, content: string, tags: string[]): Promise<Post> {
    const postId = crypto.randomUUID().toString();
    const postObject = {_id: postId, userId, title, content, tags, upVotes: 0};
    const model = new PostModel(postObject);
    try {
        const userDoc = await model.save();
        postCache.set(postId, userDoc.toObject());
        return userDoc.toObject();
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
        .sort({ createdAt: -1 }) // Sort by creationTime descending (newest first)
        .limit(max)
        .lean() // Convert to plain JavaScript objects
        .exec();
}

export async function getUserPosts(userId: string, max: number) {
    return await PostModel.find({userId})
        .sort({ createdAt: -1 }) // Sort by creationTime descending (newest first)
        .limit(max)
        .lean() // Convert to plain JavaScript objects
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
                totalUpvotes: { $sum: '$upVotes' },
            },
        },
        { $sort: { totalUpvotes: -1 } },
        { $limit: limit },
    ]);
}

export async function addVote(postId: string) {
    const post = await getPost(postId);
    if (!post) {
        return undefined;
    }
    if (isNaN(post.upVotes)) {
        post.upVotes = 1;
    } else {
        post.upVotes += 1;
    }
    return await updatePostVotes(postId, post);
}

export async function removeVote(postId: string) {
    const post = await getPost(postId);
    if (!post) {
        return undefined;
    }
    if (!isNaN(post.upVotes)) {
        post.upVotes -= 1;
    }
    return await updatePostVotes(postId, post);
}

async function updatePostVotes(postId: string, post: Post) {
    postCache.set(postId, post);
    return PostModel.findOneAndUpdate(
        {_id: postId},
        {$set: {upVotes: post.upVotes}},
        {
            upsert: true,
            new: true,  // return new/updated document
            setDefaultsOnInsert: true,
        },
    ).exec();
}
