import mongoose, { Document, Model, ObjectId, Schema } from 'mongoose';

interface ITweet extends Document {
    user: ObjectId;
    liked: boolean;
    countOfLikes: number;
    likedBy: ObjectId;
    tweet: string;
    comments: string[];
}

const TweetSchema: Schema<ITweet> = new mongoose.Schema({
    user: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    likedBy: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    liked: { type: Boolean, default: false },
    countOfLikes: { type: Number, default: 0 },
    tweet: { type: String, required: true },
    comments: [{
        user: { type: Schema.Types.ObjectId, ref: 'User', required: true },
        comment: { type: String, required: true },
        commentedAt: { type: Date, default: Date.now }
    }]
});

export const Tweet: Model<ITweet> = mongoose.model<ITweet>('Tweet', TweetSchema);