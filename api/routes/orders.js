const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const checkAuth = require('../middleware/check-auth');

const Order = require('../models/order');
const Product = require('../models/product');

const OrdersController = require('../controllers/orders');

router.get('/', checkAuth, OrdersController.orders_get_all);

router.post('/', checkAuth, (req, res, next) => {
    Product.findById(req.body.productId)
    .then(product => {
        if (!product) {
            return res.status(404).json({
                message: 'Product not Found'
            });
        }
        const order = new Order({
            _id: mongoose.Types.ObjectId(),
            quantity: req.body.quantity,
            product: req.body.productId
        });
        return order.save();
    })
    .then(result => {
        console.log(result);
        res.status(201).json({
            message: 'Order Successfully Created ',
                order: {
                    product: result.product,
                    quantity: result.quantity,
                    _id: result._id,
                    request: {
                        type: 'GET',
                        url: 'http://localhost:3000/orders/' + result._id
                    }
                }
        });
    })
    .catch(err => {
        console.log(err);
        res.status(500).json(err);
    });   
});

router.get('/:orderId', checkAuth, (req, res, next) => {
    const id = req.params.orderId;
    Order.findById(id)
        .select('product quantity _id')
        .populate('product', 'name')
        .exec()
        .then(
            doc => {
                console.log(doc);
                if (doc) {
                    res.status(200).json({
                        order: doc,
                        request: {
                            type: 'GET',
                            url: 'http://localhost:3000/orders'
                        }
                    });
                } else {
                    res.status(404).json({
                        message: 'Not Found'
                    });
                }
            }
        )
        .catch(
            err => {
                console.log(err);
                res.status(500).json({
                    error: err
                });
            }
        );
});

router.delete('/:orderId', checkAuth, (req, res, next) => {
    const id = req.params.orderId;
    Order.remove({ _id: id })
        .exec()
        .then(result => {
            console.log(result);
            res.status(200).json({
                message: 'Order Successfully Deleted',
                request: {
                    type: 'GET',
                    url: 'http://localhost:3000/products'
                }
            });
        })
        .catch(err => {
            console.log(err);
            res.status(500).json({
                error: err
            });
        });
});

module.exports = router;