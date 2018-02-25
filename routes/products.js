const multer = require('multer');
const express = require('express');

const checkAuth = require('../middleware/check-auth');

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

const ProductsController = require('../controllers/products');

router.get('/', ProductsController.productsGetAll);
router.post('/', checkAuth, upload.single('productImage'), ProductsController.productsCreateProduct);
router.get('/:productId', ProductsController.productsGetProduct);
router.patch('/:productId', checkAuth, ProductsController.productsUpdateProduct);
router.delete('/:productId', checkAuth, ProductsController.productsDeleteProduct);

module.exports = router;
