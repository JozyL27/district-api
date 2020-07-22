const express = require('express')
const ArticlesService = require('./articles-service')

const jsonBodyParser = express.json()
const ArticlesRouter = express.Router()

ArticlesRouter
    .route('/categories')
    .get(async (req, res, next) => {
        try {
            const categories = await ArticlesService.getCategories(
                req.app.get('db')
            )
            res.status(200).json(categories)
        } catch(error) {
            next(error)
        }
    })


module.exports = ArticlesRouter