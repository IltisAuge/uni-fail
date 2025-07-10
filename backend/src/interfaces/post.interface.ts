export interface Post {
    _id: string;
    title: string;
    content: string;
    userId: string;
    createdAt: Date;
    updatedAt: Date;
    tags: string[];
    upVotes: number;
}
export type PostDocument = Post & Document;
