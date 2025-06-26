import AWS, {Credentials} from 'aws-sdk';
import path from 'node:path';
import fs from 'fs';

const s3 = new AWS.S3({ region: process.env.S3_REGION as string,
    credentials: new Credentials({
        accessKeyId: process.env.S3_ACCESS_KEY as string,
        secretAccessKey: process.env.S3_SECRET_KEY as string,
        sessionToken: undefined
    })
});

export async function downloadAllAvatars() {
    const listedObjects = await s3.listObjectsV2({
        Bucket: process.env.S3_BUCKET_NAME as string
    }).promise();
    if (!listedObjects.Contents) {
        return;
    }
    for (const object of listedObjects.Contents) {
        const key = object.Key;
        if (!key) continue;

        const avatarDir = path.resolve('./avatars');
        const avatarFile = path.join(avatarDir, key);
        fs.mkdirSync(avatarDir, { recursive: true });
        console.log(avatarFile);

        const fileStream = fs.createWriteStream(avatarFile);
        const s3Stream = s3.getObject({
            Bucket: process.env.S3_BUCKET_NAME as string, Key: key
        }).createReadStream();
        await new Promise<void>((resolve, reject) => {
            s3Stream.pipe(fileStream)
                .on('error', reject)
                .on('close', resolve);
        });
    }
}
