const express = require('express');
const mongoose = require('mongoose');

const router = express.Router();

const Order = require('../models/order');
const Product = require('../models/product');

router.get('/', async (req, res, next) => {
    try {
        let docs = await Order.find()
            .populate('product')
            .select('product quantity _id')
            .exec();

        res.status(200).json({
            count: docs.length,
            orders: docs.map(doc => {
                return {
                    Id: doc._id,
                    product: doc.product,
                    quantity: doc.quantity,
                    request: {
                        type: 'GET',
                        url: `http://localhost:3000/${doc._id}`
                    }
                };
            })
        });
    } catch (error) {
        console.log('error: ', error);
        res.status(500).json({ error });
    }
});

router.post('/', async (req, res, next) => {
    try {
        let product = Product.findById(req.body.productId);

        if (!product) {
            res.status(500).json({ message: 'Product not found' });
        }

        const order = new Order({
            _id: mongoose.Types.ObjectId(),
            quantity: req.body.quantity,
            product: req.body.productId
        });

        try {
            let result = await order.save();

            res.status(201).json({
                message: 'Order stored',
                request: {
                    type: 'GET',
                    url: `http://localhost:3000/${result._id}`
                },
                createdOrder: {
                    Id: result._id,
                    product: result.product,
                    quantity: result.quantity
                }
            });
        } catch (error) {
            console.log('error: ', error);
            res.status(500).json({ error });
        }
    } catch (error) {
        console.log('error: ', error);
        res.status(500).json({
            message: 'Product not found',
            error
        });
    }
});

router.get('/:orderId', async (req, res, next) => {
    try {
        let doc = await Order.findById(req.params.orderId)
            .populate('product')
            .exec();

        if (!doc) {
            res.status(404).json({
                message: 'Order not found'
            });
        }

        res.status(200).json({
            order,
            request: {
                type: 'GET',
                url: `http://localhost:3000/orders`
            }
        });
    } catch (error) {
        console.log('error: ', error);
        res.status(500).json({ error });
    }
});

router.delete('/:orderId', async (req, res, next) => {
    try {
        let result = await Order.remove({ _id: req.params.orderId });

        res.status(200).json({
            message: 'Order deleted',
            request: {
                type: 'POST',
                url: `http://localhost:3000/orders`,
                body: { productId: 'ID', quantity: 'Number' }
            }
        });
    } catch (error) {
        console.log('error: ', error);
        res.status(500).json({ error });
    }
});

module.exports = router;
