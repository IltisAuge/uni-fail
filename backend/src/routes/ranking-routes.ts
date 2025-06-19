import {Router} from 'express';
import {getUniRankingMostVotes} from '../controller/post-controller';

const rankingRouter = Router();

rankingRouter.get('/most-votes', (req, res) => {
    const limit = Number(req.query.limit) || 5;
    getUniRankingMostVotes(limit).then(r => {
        console.log(r);
        res.json(r);
    })
});

export default rankingRouter;
