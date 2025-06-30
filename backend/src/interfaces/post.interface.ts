export interface Post {
    _id: string;
    title: string;
    content: string;
    userId: string;
    createdAt: Date;
    updatedAt: Date;
    tags: string[];
    upVotes: {
        type: number,
        default: 0,
    },
}
export type PostDocument = Post & Document;
