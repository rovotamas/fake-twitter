import { Router, Request, Response, NextFunction } from 'express';
import { PassportStatic } from 'passport';
import { User } from '../model/User';
import bcrypt from 'bcrypt';


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

    router.post('/register', (req: Request, res: Response) => {
        const email = req.body.email;
        const birthDate = req.body.birthDate;
        const password = req.body.password;
        const user = new User({email: email, password: password, birthDate: birthDate, isAdmin: false});
        user.save().then(data => {
            res.status(200).send(data);
        }).catch(error => {
            res.status(500).send(error);
        })
    });

    router.post('/register/admin', (req: Request, res: Response) => {
        const email = req.body.email;
        const birthDate = req.body.birthDate;
        const password = req.body.password;
        const user = new User({email: email, password: password, birthDate: birthDate, isAdmin: true});
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

    router.delete('/user/:email', (req: Request, res: Response) => {
        if (req.isAuthenticated()) {
            User.findByIdAndDelete({email: req.params.email})
                .then((deletedUser) => {
                    if (deletedUser) {
                        res.status(200).send(`User with ID ${req.params.email} deleted.`);
                    } else {
                        res.status(404).send(`User with ID ${req.params.email} not found.`);
                    }
                })
                .catch((error) => {
                    console.error(error);
                    res.status(500).send('Internal server error.');
                });
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
        if(req.isAuthenticated()){
            User.find({})
                .then((users) => {
                    res.status(200).send(users);
                })
                .catch((error) => {
                    console.error(error);
                    res.status(500).send('Internal server error.');
                });
        }
    });

    return router;
}