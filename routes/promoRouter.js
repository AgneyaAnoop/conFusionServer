const express = require('express');
const bodyParser = require('body-parser');
const { application } = require('express');
const mongoose = require('mongoose');
const Promotions = require('../models/promotions');
const promoRouter = express.Router();
const authenticate = require('../authenticate');
const cors = require('./cors');
promoRouter.use(bodyParser.json());

promoRouter.route('/')
.options(cors.corsWithOptions, (req, res) => res.sendStatus(200))
.get(cors.cors,(req, res, next) => {
    Promotions.find({}).then((prom) => {
        res.statusCode = 200;
        res.setHeader("Content-Type", "application/json");
        res.json(prom);
    },
    (err) => next(err)
    ).catch((err) => next(err));
}
)
.post(cors.corsWithOptions,authenticate.verifyUser,authenticate.verifyAdmin,(req, res, next) => {
    Promotions.create(req.body).then((prom) =>{
        console.log('Promotion created ',prom);
        res.statusCode = 200;
        res.setHeader("Content-Type", "application/json");
        res.json(prom);
    },(err) => next(err)
    ).catch((err) => next(err));
})
.put(cors.corsWithOptions,authenticate.verifyUser,authenticate.verifyAdmin,(req, res, next) => {
    res.statusCode = 403;
    res.end('PUT operation not supported on /promotions');
})
.delete(cors.corsWithOptions,authenticate.verifyUser,authenticate.verifyAdmin,(req, res, next) => {
    Promotions.remove({}).then((prom) =>{
        res.statusCode = 200;
        res.setHeader("Content-Type", "application/json");
        res.json(prom);
    },(err) => next(err)
    ).catch((err) => next(err));
}
);

promoRouter.route('/:promoId')
.options(cors.corsWithOptions, (req, res) => res.sendStatus(200))
.get(cors.cors,(req, res, next) => {
    Promotions.findById(req.params.promoId)
    .then((prom)=>{
        res.statusCode = 200;
        res.setHeader("Content-Type", "application/json");
        res.json(prom);
    },(err) => next(err)
    ).catch((err) => next(err));
})
.post(cors.corsWithOptions,authenticate.verifyUser,authenticate.verifyAdmin,(req, res, next) => {
    res.statusCode = 403;
    res.end('POST operation not supported on /promotions/' + req.params.promoId);
})
.put(cors.corsWithOptions,authenticate.verifyUser,authenticate.verifyAdmin,(req, res, next) => {
    Promotions.findByIdAndUpdate(req.params.promoId, { $set: req.body },
        { new: true } )
    .then((prom)=>{
        res.statusCode = 200;
        res.setHeader("Content-Type", "application/json");
        res.json(prom);
    },(err) => next(err)
    ).catch((err) => next(err));
})
.delete(cors.corsWithOptions,authenticate.verifyUser,authenticate.verifyAdmin,(req, res, next) => {
    Promotions.findByIdAndRemove(req.params.promoId)
    .then((prom)=>{
        res.statusCode = 200;
        res.setHeader("Content-Type", "application/json");
        res.json(prom);
    },(err) => next(err)
    ).catch((err) => next(err));
});

module.exports = promoRouter;






