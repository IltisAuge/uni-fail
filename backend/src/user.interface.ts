export interface IUser {
    _id: string;
    provider: string;
    email: string;
    name: string;
    isAdmin: boolean;
    displayName: string;
    avatarKey: string;
    isBlocked: boolean;
    [key: string]: any;
}
export type IUserDocument = IUser & Document;
