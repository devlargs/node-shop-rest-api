const multer = require('multer');
const express = require('express');
const mongoose = require('mongoose');

const storage = multer.diskStorage({
    destination: (req, file, callback) => {
        callback(null, './uploads');
    },
    filename: (req, file, callback) => {
        callback(null, `${new Date().toISOString()}${file.originalname}`);
    }
});

const fileFilter = (req, file, callback) => {
    if (file.mimetype === 'image/jpeg' || file.mimetype === 'image/png') {
        callback(null, true);
    }

    callback(null, false);
};

const router = express.Router();
const upload = multer({ 
    storage, 
    fileFilter,
    limits: { fileSize: 1024 * 1024 * 5 } 
});

const Product = require('../models/product');

router.get('/', async (req, res, next) => {
    try {
        let docs = await Product.find()
            .select('name price _id productImage')
            .exec();

        const response = {
            count: docs.length,
            products: docs.map(doc => {
                return {
                    name: doc.name,
                    price: doc.price,
                    Id: doc._id,
                    productImage: doc.productImage,
                    request: {
                        type: 'GET',
                        url: `http://localhost:3000/products/${doc._id}`
                    }
                };
            })
        };

        res.status(200).json(response);
    } catch (error) {
        console.log('error: ', error);
        res.json(500).json({ error });
    }
});

router.post('/', upload.single('productImage'), async (req, res, next) => {
    console.log(req.file);
    const product = new Product({
        _id: new mongoose.Types.ObjectId(),
        name: req.body.name,
        price: req.body.price,
        productImage: req.file.path
    });

    try {
        let result = await product.save();

        res.status(201).json({
            createdProduct: {
                name: result.name,
                price: result.price,
                Id: result._id,
                request: {
                    type: 'GET',
                    url: `http://localhost:3000/${result._id}`
                }
            },
            message: 'Created product successfully'
        });
    } catch (error) {
        console.log('error: ', error);
        res.status(500).json({ error });
    }
});

router.get('/:productId', async (req, res, next) => {
    const id = req.params.productId;

    try {
        let doc = await Product.findById(id)
            .select('name price _id productImage')
            .exec();

        if (!doc) {
            res
                .status(404)
                .json({ message: 'No valid entry found for provided ID' });
        }

        res.status(200).json({
            product: doc,
            request: {
                type: 'GET',
                url: `http:localhost:3000/products`
            }
        });
    } catch (error) {
        console.log('error: ', error);
        res.status(500).json({ error });
    }
});

router.patch('/:productId', async (req, res, next) => {
    try {
        let result = await Product.update(
            { _id: req.params.productId },
            { $set: { name: req.body.name, price: req.body.price } }
        ).exec();

        res.status(200).json({
            message: 'Product updated',
            request: {
                type: 'GET',
                url: `http:localhost:3000/products/${result._id}`
            }
        });
    } catch (error) {
        console.log('error: ', error);
        res.status(500).json({ error });
    }
});

router.delete('/:productId', async (req, res, next) => {
    try {
        let result = await Product.remove({ _id: req.params.productId }).exec();

        res.status(200).json(result);
    } catch (error) {
        console.log('error: ', error);
        res.status(500).json({ error });
    }
});

module.exports = router;
