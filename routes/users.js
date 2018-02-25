const bcrypt = require('bcrypt');
const express = require('express');
const mongoose = require('mongoose');

const router = express.Router();

const User = require('../models/user');

router.post('/signup', async (req, res, next) => {
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
});

router.delete('/:userId', async (req, res, next) => {
    try {
        let result = await User.remove({ _id: req.params.orderId }).exec();

        res.status(200).json({ message: 'User deleted' });
    } catch (error) {
        console.log('error: ', error);
        res.status(500).json({ error });
    }
});

module.exports = router;
