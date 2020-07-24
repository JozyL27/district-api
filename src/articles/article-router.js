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
            res.status(200).json(categories.rows)
        } catch(error) {
            next(error)
        }
    })

ArticlesRouter
    .route('/latest')
    .get(jsonBodyParser, async (req, res, next) => {
        const { page } = req.body
        try {
            const articles = await ArticlesService.getMostRecentArticles(
                req.app.get('db'),
                page
            )
            res.status(200).json(articles)
        } catch(error) {
            next(error)
        }
    })

ArticlesRouter
    .route('/')
    .get(jsonBodyParser, async (req, res, next) => {
        const { page } = req.body
        try {
            const articles = await ArticlesService.getAllArticles(
                req.app.get('db'),
                page
            )
            res.status(200).json(articles)
        } catch(error) {
            next(error)
        }
    })

ArticlesRouter
    .route('/:articleId/comments')
    .get(jsonBodyParser, async (req, res, next) => {
        const { articleId } = req.params
        const { page } = req.body
        try {
            const comments = await ArticlesService.getArticleComments(
                req.app.get('db'),
                articleId,
                page
            )
            res.status(200).json(comments)
        } catch(error) {
            next(error)
        }
    })



module.exports = ArticlesRouter