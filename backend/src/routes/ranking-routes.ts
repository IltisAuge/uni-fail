import {Router} from 'express';
import {getUniRankingMostVotes} from '@/controllers/post-controller';

const rankingRouter = Router();

rankingRouter.get('/most-votes', (req, res) => {
    const limit = Number(req.query.limit) || 5;
    getUniRankingMostVotes(limit).then((rankedUnis) => {
        res.json(rankedUnis);
        return rankedUnis;
    }).catch((error) => {
        console.error('An error occurred while trying to get most votes:', error);
    });
});

export default rankingRouter;
