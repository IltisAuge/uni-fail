import {Router} from 'express';
import {createPost, deletePost, getNewestPosts, getPost} from '../controller/post-controller';
import {getUser} from '../controller/user-controller';
import {PostModel} from '../schemata/schemata';

const postRouter = Router();

postRouter.use((req, res, next) => {
    const isPublic = req.method === 'GET' &&
        (req.path === '/get' || req.path === '/search' || /^\/[^\/]+$/.test(req.path));

    if (!isPublic && !req.session.userId) {
        res.status(401).send("Unauthorized:Authentification required.");
    }

    next();
});

postRouter.get('/get', (req, res) => {
    const filter = req.query.filter;
    const max = req.query.max as unknown as number;
    switch (filter) {
        case 'newest':
            getNewestPosts(max)
                .then(result => res.status(200).json(result));
            break;
        default:
            res.status(400).json({error: "Unknown filter ...."});
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
            // Titel contains the search query (case-insensitive)
            { title: { $regex: query, $options: 'i' } },
            // A tag contains the search query (case-insensitive)
            { tags: { $elemMatch: { $regex: query, $options: 'i' } } },
            // A tag starts with "uni:" and contains the search query (case-insensitive)
            { tags: { $elemMatch: { $regex: `^uni:.*${query}.*`, $options: 'i' } } }
        ]
    });
    res.json({items: posts});
});

postRouter.get('/:id', async (req, res) => {
    try {
        const postId = req.params.id;
        const post = await getPost(postId);

        if (!post) {
            res.status(404).json({message: "No post with id " + postId});
            return;
        }

        const author = await getUser(post.userId);

        const postWithUser = {
            ...post,
            userName: author?.displayName || 'unbekannt'
        };

        console.log('Fetching post with ID:', postId);
        console.log('Author is:', author?.displayName);
        res.status(200).json(postWithUser);
    } catch (err) {
        console.error('Error getting post with ID', err);
        res.status(500).send({message: 'Servererror getting post'});
    }
});


postRouter.post('/create', async (req, res) => {
    const title = req.body.title;
    const content = req.body.content;
	const tags = req.body.tags;
	const userId = req.session.userId!;
    const user = await getUser(userId);
    if (!user) {
        res.status(404).send("User not found!");
        return;
    }
	console.log(content);
	console.log(tags);
	createPost(userId, title, content, tags).then(result => {
		res.status(200).json(result);
	}).catch(error => {
		res.status(500).send(error);
	});
});

postRouter.delete('/delete/:id', async (req, res) => {
	const postId = req.params.id;
    const userId = req.session.userId!;
    const user = await getUser(userId);
	if (!user) {
		res.status(404).send("User not found!");
		return;
	}
	const post = await getPost(postId);
	if (!post) {
		res.status(404).send("Post with id '" + postId + "' not found");
		return;
	}
	if (post.userId !== userId && !user.isAdmin) {
		res.status(403).send("No permission to delete this post");
	}
    deletePost(postId).then(result => {
		res.status(result.acknowledged ? 200 : 500).send();
	});
});

export default postRouter;
