import NodeCache from 'node-cache';
import {User} from '@/interfaces/user.interface';
import {DisplayNamesModel} from '@/schemata/display-names-schema';
import {UserModel} from '@/schemata/user-schema';

const userCache = new NodeCache();
let availableDisplayNames: string[] = [];

export async function loadAvailableDisplayNames(): Promise<string[]> {
    const doc = await DisplayNamesModel.findOne({_id: 0});
    if (!doc) {
        await DisplayNamesModel.create({ _id: 0, names: [] });
        return [];
    }
    availableDisplayNames = doc.names;
    return availableDisplayNames;
}

export function getRandomDisplayName(): string {
    if (availableDisplayNames.length === 0) {
        throw new Error('No display names are available!');
    }
    let randomIndex;
    let displayName;
    do {
        randomIndex = Math.floor(Math.random() * availableDisplayNames.length);
        displayName = availableDisplayNames[randomIndex];
    } while (!isDisplayNameAvailable(displayName));
    return displayName;
}

export async function isDisplayNameAvailable(displayName: string): Promise<boolean> {
    const includes = availableDisplayNames.includes(displayName);
    const existsUser = !!await UserModel.findOne({displayName});
    return !includes && !existsUser;
}

export async function saveUser(userData: User) {
    userCache.set(userData._id, userData);
    const data = { ...userData };
    return UserModel.findOneAndUpdate(
        {_id: data._id},
        {$set: data},
        {
            upsert: true,
            new: true,  // return new/updated document
            setDefaultsOnInsert: true,
        },
    );
}

export async function deleteUser(userId: string) {
    userCache.del(userId);
    return UserModel.deleteOne({_id: userId}).exec();
}

export async function getUser(userId: string): Promise<User | undefined> {
    if (userId === '000000000') {
        return {
            _id: '000000000',
            provider: 'Mock Provider',
            email: 'mock@mail.com',
            name: 'Mock Name',
            isAdmin: false,
            displayName: 'Mock Displayname',
            avatarKey: '2289_SkVNQSBGQU1PIDEwMjgtMTIy.jpg',
            votedPosts: [],
            isBlocked: false,
        };
    }
    const cachedUser = userCache.get(userId) as unknown as User;
    if (cachedUser) {
        return cachedUser;
    }
    const user = await UserModel.findOne({ _id: userId }).lean().exec();
    if (user) {
        userCache.set(userId, user);
        return user;
    }
    return undefined;
}

async function updateUserField(userId: string, field: string, value: any) {
    const cachedUser = userCache.get(userId) as User | undefined;
    if (cachedUser) {
        cachedUser[field] = value;
        userCache.set(userId, cachedUser);
    }
    return UserModel.findOneAndUpdate(
        {_id: userId},
        {$set: {[field]: value}},
        {
            upsert: true,
            new: true,  // return new/updated document
            setDefaultsOnInsert: true,
        },
    );
}

export async function addVotedPost(_id: string, postId: string) {
    console.log(`addVotedPost: _id=${_id} postId=${postId}`);
    const user = await getUser(_id);
    console.log(user);
    if (!user) {
        return;
    }
    const s = [...user.votedPosts, postId];
    console.log(s);
    return await updateUserField(_id, 'votedPosts', s);
}

export async function removeVotedPost(_id: string, postId: string) {
    console.log(`removeVotedPost: _id=${_id} postId=${postId}`);
    const user = await getUser(_id);
    console.log(user);
    if (!user) {
        return;
    }
    const s = user.votedPosts.filter((id) => id !== postId);
    console.log(s);
    return await updateUserField(_id, 'votedPosts', s);
}

export async function setDisplayName( _id: string, displayName: string) {
    return await updateUserField(_id, 'displayName', displayName);
}

export async function setAvatarKey( _id: string, avatarKey: string) {
    return await updateUserField(_id, 'avatarKey', avatarKey);
}

export async function setAdmin(_id: string, status: boolean) {
    return await updateUserField(_id, 'isAdmin', status);
}

export async function setBlocked(_id: string, status: boolean) {
    return await updateUserField(_id, 'isBlocked', status);
}
