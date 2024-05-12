export interface Tweet {
  _id: string;
  user: string;
  liked: boolean;
  countOfLikes: number;
  likedBy: string;
  tweet: string;
  comments: Array<{
    user: string;
    comment: string;
    commentedAt: Date;
  }>;
  createdAt: Date;
}
