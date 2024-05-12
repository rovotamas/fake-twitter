import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { User } from '../model/User';
import {Tweet} from '../model/Tweet';

@Injectable({
  providedIn: 'root'
})
export class TweetService {

  constructor(private http: HttpClient) { }

  getAll() {
    return this.http.get<User[]>('http://localhost:5000/app/tweets', {withCredentials: true});
  }

  create(userId: string, tweet: string) {
    return this.http.post('http://localhost:5000/app/tweets', {userId: userId, tweet: tweet}, {withCredentials: true});
  }

  like(tweetId: string, userId: string) {
    return this.http.patch('http://localhost:5000/app/tweets/like', {tweetId, userId}, {withCredentials: true});
  }

  addComment(tweetId: string, comment:
    { user: string;
    comment: string;
    commentedAt: Date }) {
    return this.http.post('http://localhost:5000/app/tweets/add/comment', {tweetId: tweetId, comment: comment}, {withCredentials: true});
  }
  updateTweet(tweetId: string, tweet: string, userId: string) {
    this.http.patch('http://localhost:5000/app/tweets/update/tweet', {tweetId: tweetId,tweet, userId}, {withCredentials: true});
  }
  delete(id: string, userId: string) {
    return this.http.delete('http://localhost:5000/app/deleteUser?id=' + id+`&userId=${userId}`, {withCredentials: true});
  }

  updateUserIsActive(id: string) {
    return this.http.patch('http://localhost:5000/app/users/activate?id=' + id, {withCredentials: true});
  }
}
