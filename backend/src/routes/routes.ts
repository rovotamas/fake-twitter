import { Router, Request, Response, NextFunction } from 'express';
import { PassportStatic } from 'passport';
import { User } from '../model/User';
import bcrypt from 'bcrypt';
import {Tweet} from '../model/Tweet';


export const configureRoutes = (passport: PassportStatic, router: Router): Router => {



    router.post('/login', (req: Request, res: Response, next: NextFunction) => {
        passport.authenticate('local', (error: string | null, user: typeof User) => {
            if (error) {
                console.log(error);
                res.status(500).send(error);
            } else {
                if (!user) {
                    res.status(400).send('User not found.');
                } else {
                    req.login(user, (err: string | null) => {
                        if (err) {
                            console.log(err);
                            res.status(500).send('Internal server error.');
                        } else {
                            res.status(200).send(user);
                        }
                    });
                }
            }
        })(req, res, next);
    });

    router.patch('/users/activate', async (req: any, res) => {


            const id = req.query.id;
            try {
                const user = await User.findById({_id: id});
                if (!user) {
                    return res.status(404).send('User not found');
                }

                user.isActive = !user.isActive;

                await user.save();

                res.status(200).send('User status updated successfully');
            } catch (error) {
                console.error(error);
                res.status(500).send('Internal server error.');
            }
        });

    router.delete('/deleteUser', (req: Request, res: Response) => {
        if (req.isAuthenticated()) {
            const id = req.query.id;
            const query = User.deleteOne({_id: id});
            query.then(data => {
                res.status(200).send(data);
            }).catch(error => {
                console.log(error);
                res.status(500).send('Internal server error.');
            })
        } else {
            res.status(500).send('User is not logged in.');
        }
    });

    router.get('/checkAuth', (req: Request, res: Response) => {
        if (req.isAuthenticated()) {
            res.status(200).send(true);
        } else {
            res.status(500).send(false);
        }
    });

    router.post('/register', (req: Request, res: Response) => {
        const email = req.body.email;
        const name = req.body.name;
        const birthDate = req.body.birthDate;
        const password = req.body.password;
        const user = new User({email: email, password: password, birthDate: birthDate, isAdmin: false, name: name, isActive: true});
        user.save().then(data => {
            res.status(200).send(data);
        }).catch(error => {
            res.status(500).send(error);
        })
    });

    router.post('/register/admin', (req: Request, res: Response) => {
        const email = req.body.email;
        const name = req.body.name;
        const birthDate = req.body.birthDate;
        const password = req.body.password;
        const user = new User({email: email, password: password, birthDate: birthDate, name: name, isActive: true, isAdmin: true});
        user.save().then(data => {
            res.status(200).send(data);
        }).catch(error => {
            res.status(500).send(error);
        })
    });

    router.post('/logout', (req: Request, res: Response) => {
        if (req.isAuthenticated()) {
            req.logout((error) => {
                if (error) {
                    console.log(error);
                    res.status(500).send('Internal server error.');
                }
                res.status(200).send('Successfully logged out.');
            })
        } else {
            res.status(500).send('User is not logged in.');
        }
    });



    router.patch('/user/update/:email', async (req: Request, res: Response) => {
        if (req.isAuthenticated()) {
        const { email, password, birthDate } = req.body;

        const updateFields: any = {};

        if (email) {
            updateFields.email = email;
        }

        if (password) {
            const saltRounds = 10;
            const hashedPassword = await bcrypt.hash(password, saltRounds);
            updateFields.password = hashedPassword;
        }

        if (birthDate) {
            updateFields.birthDate = birthDate;
        }

        User.findByIdAndUpdate({email: req.params.email}, updateFields, { new: true })
            .then((updatedUser) => {
                if (updatedUser) {
                    res.status(200).send(updatedUser);
                } else {
                    res.status(404).send('User not found');
                }
            })
            .catch((error) => {
                console.error(error);
                res.status(500).send('Internal server error');
            });
        }
    });

    router.get('/users', (req: Request, res: Response) => {
        User.find({})
            .then((users) => {
                res.status(200).send(users);
            })
            .catch((error) => {
                console.error(error);
                res.status(500).send('Internal server error.');
            });
        // if(req.isAuthenticated()){
        //
        // }
    });


    router.get('/tweets', (req: Request, res: Response) => {
        if(req.isAuthenticated()){
            Tweet.find({})
                .then((tweets) => {
                    res.status(200).send(tweets);
                })
                .catch((error) => {
                    console.error(error);
                    res.status(500).send('Internal server error.');
                });
        }
    });

    router.post('/tweets', (req: any, res) => {
        if (!req.isAuthenticated()) {
            return res.status(401).send('Unauthorized');
        }

        const userId = req.user._id;

        const newTweet = new Tweet({
            user: userId,
            liked: false,
            countOfLikes: 0,
            tweet: req.body.tweet,
            comments: [],
            createdAt: new Date()
        });

        newTweet.save()
            .then((tweet) => {
                res.status(201).send(tweet);
            })
            .catch((error) => {
                console.error(error);
                res.status(500).send('Internal server error.');
            });
    });

    router.patch('/tweets/like', async (req: any, res) => {
        if (!req.isAuthenticated()) {
            return res.status(401).send('Unauthorized');
        }

        const { tweetId } = req.body;
        const {userId} = req.body;

        try {
            const tweet: any = await Tweet.findById(tweetId);
            if (!tweet) {
                return res.status(404).send('Tweet not found');
            }

            const userLiked = tweet.likedBy.includes(userId);

            if (req.body.like && !userLiked) {
                tweet.liked = true;
                tweet.countOfLikes++;
                tweet.likedBy.push(userId);
            } else if (!req.body.like && userLiked) {
                tweet.liked = false;
                tweet.countOfLikes--;
                tweet.likedBy = tweet.likedBy.filter((id: any) => id !== userId);
            }

            await tweet.save();

            res.status(200).send(tweet);
        } catch (error) {
            console.error(error);
            res.status(500).send('Internal server error.');
        }
    });

    router.post('/tweets/add/comment', async (req:any, res) => {
        if (!req.isAuthenticated()) {
            return res.status(401).send('Unauthorized');
        }

        const { tweetId } = req.body;
        const { comment } = req.body;

        try {
            const tweet = await Tweet.findById(tweetId);
            if (!tweet) {
                return res.status(404).send('Tweet not found');
            }

            tweet.comments.push(comment);

            await tweet.save();

            res.status(201).send(tweet);
        } catch (error) {
            console.error(error);
            res.status(500).send('Internal server error.');
        }
    });

    router.patch('/tweets/update/tweet', async (req:any, res) => {
        if (!req.isAuthenticated()) {
            return res.status(401).send('Unauthorized');
        }

        const { tweetId } = req.body;
        const {userId} = req.body;
        const { tweet: updatedTweet } = req.body;

        try {
            const tweet = await Tweet.findById(tweetId);
            if (!tweet) {
                return res.status(404).send('Tweet not found');
            }

            if (tweet.user.toString() !== userId.toString()) {
                return res.status(403).send('Forbidden');
            }
            tweet.tweet = updatedTweet;

            await tweet.save();

            res.status(200).send(tweet);
        } catch (error) {
            console.error(error);
            res.status(500).send('Internal server error.');
        }
    });

    router.delete('/tweets', async (req:any, res) => {
        if (!req.isAuthenticated()) {
            return res.status(401).send('Unauthorized');
        }

        const id = req.query.id;
        const userId = req.query.userId

        try {
            const tweet = await Tweet.findById({ _id: id });
            if (!tweet) {
                return res.status(404).send('Tweet not found');
            }

            if (tweet.user.toString() !== userId.toString() && !req.user.isAdmin) {
                return res.status(403).send('Forbidden');
            }

            await Tweet.findByIdAndDelete({ _id: id });

            res.status(204).send();
        } catch (error) {
            console.error(error);
            res.status(500).send('Internal server error.');
        }
    });

    module.exports = router;

    return router;
}