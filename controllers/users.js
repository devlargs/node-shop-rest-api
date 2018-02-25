const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const mongoose = require('mongoose');

const User = require('../models/user');

exports.usersSignup = async (req, res, next) => {
    try {
        let user = User.find({ email: req.body.email });

        if (user.length) {
            res.status(409).json({ message: 'Email exists' });
        }

        bcrypt.hash(req.body.password, 10, (err, hash) => {
            if (err) {
                return res.status(500).json({ error: err });
            }

            const user = new User({
                _id: new mongoose.Types.ObjectId(),
                email: req.body.email,
                password: hash
            });

            try {
                let result = user.save();
                console.log('result: ', result);

                res.status(200).json({ message: 'User created' });
            } catch (error) {
                console.log('error: ', error);
                res.status(500).json({ error });
            }
        });
    } catch (error) {
        console.log('error: ', error);
        res.status(500).json({ error });
    }
};

exports.usersLogin = async (req, res, next) => {
    try {
        let user = await User.find({ email: req.body.email }).exec();

        if (!user.length) {
            res.status(401).json({ message: 'Auth failed' });
        }

        bcrypt.compare(req.body.password, user[0].password, (err, response) => {
            if (err) {
                res.status(401).json({ message: 'Auth failed' });
            }

            if (response) {
                const token = jwt.sign(
                    { email: user[0].email, userId: user[0]._id },
                    process.env.JWT_KEY,
                    {
                        expiresIn: '1h'
                    }
                );
                res.status(200).json({ message: 'Auth successful.', token });
            }

            res.status(401).json({ message: 'Auth failed' });
        });
    } catch (error) {
        console.log('error: ', error);
        res.status(500).json({ error });
    }
};

exports.usersDeleteUser = async (req, res, next) => {
    try {
        let result = await User.remove({ _id: req.params.orderId }).exec();

        res.status(200).json({ message: 'User deleted' });
    } catch (error) {
        console.log('error: ', error);
        res.status(500).json({ error });
    }
};