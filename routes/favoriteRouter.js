const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const Favorites = require("../models/favorite");
const favoriteRouter = express.Router();
const authenticate = require("../authenticate");
const cors = require("./cors");
favoriteRouter.use(bodyParser.json());

favoriteRouter.route("/")
.options(cors.corsWithOptions, (req, res) => res.sendStatus(200))
.get(cors.cors, authenticate.verifyUser, (req, res, next) => {
    Favorites.find({user: req.user._id})
    .populate("user")
    .populate("dishes")
    .then(favorites => {
        res.statusCode = 200;
        res.setHeader("Content-Type", "application/json");
        res.json(favorites);
    })
    .catch(err => next(err));
})
.post(cors.corsWithOptions, authenticate.verifyUser, (req, res, next) => {
    Favorites.findOne({user: req.user._id})
    .then(favorites => {
        if (favorites) {
            req.body.forEach(favorite => {
                if (!favorites.dishes.includes(favorite._id)) {
                    favorites.dishes.push(favorite._id);
                }
            });
            favorites.save()
            .then(favorites => {
                res.statusCode = 200;
                res.setHeader("Content-Type", "application/json");
                res.json(favorites);
            })
            .catch(err => next(err));
        } else {
            Favorites.create({user: req.user._id, dishId: req.body})
            .then(favorites => {
                res.statusCode = 200;
                res.setHeader("Content-Type", "application/json");
                res.json(favorites);
            })
            .catch(err => next(err));
        }
    })
    .catch(err => next(err));
})
.put(cors.corsWithOptions, authenticate.verifyUser, (req, res) => {
    res.statusCode = 403;
    res.end("PUT operation not supported on /favorites");
})
.delete(cors.corsWithOptions, authenticate.verifyUser, (req, res, next) => {
    Favorites.findOneAndDelete({user: req.user._id})
    .then(response => {
        res.statusCode = 200;
        res.setHeader("Content-Type", "application/json");
        res.json(response);
    })
    .catch(err => next(err));
});

favoriteRouter.route("/:dishId")
.options(cors.corsWithOptions, (req, res) => res.sendStatus(200))
.get(cors.cors, authenticate.verifyUser, (req, res, next) => {
    res.statusCode = 403;
    res.end(`GET operation not supported on /favorites/${req.params.dishId}`);
})
.post(cors.corsWithOptions, authenticate.verifyUser, (req, res, next) => {
    Favorites.findOne({user: req.user._id})
    .then(favorites => {
        if (favorites) {
            if (!favorites.dishes.includes(req.params.dishId)) {
                favorites.dishes.push(req.params.dishId);
                favorites.save()
                .then(favorites => {
                    res.statusCode = 200;
                    res.setHeader("Content-Type", "application/json");
                    res.json(favorites);
                })
                .catch(err => next(err));
            } else {
                res.statusCode = 200;
                res.setHeader("Content-Type", "application/json");
                res.end("That dish is already a favorite!");
            }
        } else {
            Favorites.create({user: req.user._id, dishes: [req.params.dishId]})
            .then(favorites => {
                res.statusCode = 200;
                res.setHeader("Content-Type", "application/json");
                res.json(favorites);
            })
            .catch(err => next(err));
        }
    })
    .catch(err => next(err));
})
.put(cors.corsWithOptions, authenticate.verifyUser, (req, res) => {
    res.statusCode = 403;
    res.end(`PUT operation not supported on /favorites/${req.params.dishId}`);
})
.delete(cors.corsWithOptions, authenticate.verifyUser, (req, res, next) => {
    Favorites.findOne({user: req.user._id})
    .then(favorites => {
        if (favorites) {
            const index = favorites.dishes.indexOf(req.params.dishId);
            if (index >= 0) {
                favorites.dishes.splice(index, 1);
            }
            favorites.save()
            .then(favorites => {
                res.statusCode = 200;
                res.setHeader("Content-Type", "application/json");
                res.json(favorites);
            })
            .catch(err => next(err));
        } else {
            res.statusCode = 200;
            res.setHeader("Content-Type", "application/json");
            res.end("There are no favorites to delete");
        }
    })
    .catch(err => next(err));
});

module.exports = favoriteRouter;


