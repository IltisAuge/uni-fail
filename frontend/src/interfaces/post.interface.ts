export interface Post {
    _id: string;
    title: string;
    content: string;
    tags: string[];
    userId: string;
    userName: string;
    createdAt: string;
    upVotes: number;
    //downvote?: number;
}
