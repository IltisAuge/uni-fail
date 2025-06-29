import {Router} from 'express';
import rateLimit from 'express-rate-limit';
import {createPost, deletePost, getNewestPosts, getPost, getUserPosts} from '@/controller/post-controller';
import {getUser} from '@/controller/user-controller';
import {PostModel} from '@/schemata/post-schema';

const postRouter = Router();

postRouter.use((req, res, next) => {
    const isPublic = req.method === 'GET' &&
        (req.path === '/get' || req.path === '/search' || /^\/[^/]+$/.test(req.path));

    if (!isPublic && !req.session.userId) {
        res.status(401).json('Unauthorized: Authentification required.');
    }

    next();
});

const requestLimiter = rateLimit({
    windowMs: 60 * 1000,
    limit: 3,
    standardHeaders: true,
    legacyHeaders: false,
    message: 'Too many requests. Please try again later.',
});

postRouter.get('/get', (req, res) => {
    const filter = req.query.filter;
    const max = req.query.max as unknown as number;
    let userId: string;
    switch (filter) {
    case 'newest':
        getNewestPosts(max)
            .then((posts) => {
                res.status(200).json(posts);
                return posts;
            })
            .catch((error) => {
                console.error('An error occurred while getting newest posts:', error);
            });
        break;
    case 'user':
        userId = req.session.userId as unknown as string;
        if (!userId) {
            res.status(401).send();
            return;
        }
        getUserPosts(userId, max)
            .then((posts) => {
                res.status(200).json(posts);
                return posts;
            })
            .catch((error) => {
                console.error('An error occurred while getting user posts:', error);
            });
        break;
    default:
        res.status(400).json({error: `Unknown filter ${filter}`});
        break;
    }
});

postRouter.get('/search', async (req, res) => {
    const query = req.query.q;
    if (!query) {
        res.status(401).json({error: 'No search query'});
        return;
    }
    const posts = await PostModel.find({
        $or: [
            // Title contains the search query (case-insensitive)
            { title: { $regex: query, $options: 'i' } },
            // A tag contains the search query (case-insensitive)
            { tags: { $elemMatch: { $regex: query, $options: 'i' } } },
            // A tag starts with "uni:" and contains the search query (case-insensitive)
            { tags: { $elemMatch: { $regex: `^uni:.*${query}.*`, $options: 'i' } } },
        ],
    });
    res.json({items: posts});
});

postRouter.get('/:id', async (req, res) => {
    try {
        const postId = req.params.id;
        const post = await getPost(postId);
        console.log('get post:', post);
        if (!post) {
            res.status(404).json({message: `No post with id ${postId}`});
            return;
        }
        const author = await getUser(post.userId);
        const postWithUser = {
            ...post,
            userName: author?.displayName || undefined,
        };
        console.log('postWUser:', postWithUser);
        console.log('Fetching post with ID:', postId);
        console.log('Author is:', author?.displayName);
        res.status(200).json({post: postWithUser});
    } catch (error) {
        res.status(500).json({error:'An error occurred while trying to get post'});
        console.error('An error occurred while trying to get post:', error);
    }
});


postRouter.post('/create', requestLimiter, async (req, res) => {
    const title = req.body.title;
    const content = req.body.content;
    const tags = req.body.tags;
    const userId = req.session.userId!;
    const user = await getUser(userId);
    if (!user) {
        res.status(404).json({error: 'User not found!'});
        return;
    }
    createPost(userId, title, content, tags).then((post) => {
        res.status(200).json({post});
        return post;
    }).catch((error) => {
        res.status(500).json({error:'An error occurred while trying to create post'});
        console.error('An error occurred while trying to create post:', error);
    });
});

postRouter.delete('/delete/:id', async (req, res) => {
    const postId = req.params.id;
    const userId = req.session.userId!;
    const user = await getUser(userId);
    if (!user) {
        res.status(404).json({error:'User not found!'});
        return;
    }
    const post = await getPost(postId);
    if (!post) {
        res.status(404).json({error:`Post with id '${  postId  }' not found`});
        return;
    }
    if (post.userId !== userId && !user.isAdmin) {
        res.status(403).json({error:'No permission to delete this post'});
    }
    deletePost(postId).then((result) => {
        if (!result.acknowledged) {
            throw Error('Delete result not acknowledged');
        }
        res.status(200).send();
        return true;
    }).catch((error) => {
        res.status(500).json({error:'An error occurred while trying to delete post'});
        console.error('An error occurred while trying to delete post:', error);
    });
});

export default postRouter;
