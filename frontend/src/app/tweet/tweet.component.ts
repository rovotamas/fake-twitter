import {Component, Input} from '@angular/core';
import {Tweet} from '../shared/model/Tweet';
import {TweetService} from '../shared/services/tweet.service';

@Component({
  selector: 'app-tweet',
  standalone: true,
  imports: [],
  templateUrl: './tweet.component.html',
  styleUrl: './tweet.component.scss'
})
export class TweetComponent {
  tweets: Tweet[] | undefined;
  newTweet!: string;
  editingTweet: boolean | undefined;
  editedTweet: string | undefined;
  deletingTweet: boolean | undefined;

  constructor(private tweetService: TweetService) { }

  ngOnInit(): void {
    this.getTweets();
  }

  getTweets(): void {
    this.tweetService.getAll().subscribe(tweets => {
      this.tweets = tweets;
    });
  }

  createTweet(tweet: string, userId: string): void {
    this.tweetService.create(userId, tweet).subscribe(() => {
      this.getTweets();
      this.newTweet = '';
    });
  }

  toggleLike(tweetId: string, userId: string): void {
    this.tweetService.like(tweetId, userId)
  }

  editTweet(tweetId: string, tweet: string, userId: string): void {
    this.editingTweet = true;
    this.tweetService.updateTweet(tweetId, tweet, userId)
  }

}
