const express = require('express')
const ArticlesService = require('./articles-service')

const jsonBodyParser = express.json()
const ArticlesRouter = express.Router()
// post an article, get all articles from people you follow

ArticlesRouter
    .route('/categories')
    .get(async (req, res, next) => {
        try {
            const categories = await ArticlesService.getCategories(
                req.app.get('db')
            )
            if(categories.length == 0) {
                res.status(400).json({ error: 'uh oh! There are no categories left.' })
            }
            if(!categories) {
                res.status(400).json({ error: 'No categories were found.'})
            }
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
            if(articles.length == 0) {
                res.status(400).json({ error: 'uh oh! There are no articles left.' })
            }
            if(!articles) {
                res.status(400).json({ error: 'No articles were found.'})
            }
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
            if(articles.length == 0) {
                res.status(400).json({ error: 'uh oh! There are no articles left.' })
            }
            if(!articles) {
                res.status(400).json({ error: 'No articles were found.'})
            }
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
            if(comments.length == 0) {
                res.status(400).json({ error: 'No comments available.' })
            }
            if(!comments) {
                res.status(400).json({ error: 'No comments were found.'})
            }
            res.status(200).json(comments)
        } catch(error) {
            next(error)
        }
    })

ArticlesRouter
    .route('/category/:categoryId')
    .get(jsonBodyParser, async (req, res, next) => {
        let { categoryId } = req.params
        const { page } = req.body
        
        // Lowercase the category id and uppercase the first letter, removes spaces
        categoryId = categoryId.toLowerCase().split(' ').map((s) => s.charAt(0).toUpperCase() + s.substring(1)).join(' ');
        encodeURIComponent(categoryId)

        try {
            const articles = await ArticlesService.getArticlesByCategory(
                req.app.get('db'),
                categoryId,
                page
            )
            if(articles.length == 0) {
                res.status(400).json({ error: 'There are no articles under this category.' })
            }
            if(!articles) {
                res.status(400).json({ error: 'No articles were found.'})
            }
            res.status(200).json(articles)
        } catch(error) {
            next(error)
        }
    })
ArticlesRouter
    .route('/popular')
    .get(jsonBodyParser, async (req, res, next) => {
        const { page } = req.body

        try {
            const articles = await ArticlesService.getPopularArticles(
                req.app.get('db'),
                page
            )
            if(articles.length == 0) {
                res.status(400).json({ error: 'uh oh! There are no articles left.' })
            }
            if(!articles) {
                res.status(400).json({ error: 'No articles were found.'})
            }
            res.status(200).json(articles)
        } catch(error) {
            next(error)
        }
    })

ArticlesRouter
    .route('/:userId')
    .get(jsonBodyParser, async (req, res, next) => {
        const { page } = req.body
        const { userId } = req.params

        try {
            const articles = await ArticlesService.getAllUserArticles(
                req.app.get('db'),
                userId,
                page
            )
            if(articles.length == 0) {
                res.status(400).json({ error: 'You have no articles.' })
            }
            if(!articles) {
                res.status(400).json({ error: 'No articles were found.'})
            }
            res.status(200).json(articles)
        } catch(error) {
            next(error)
        }
    })

ArticlesRouter
    .route('/feed/:userId')
    .get(jsonBodyParser, async (req, res, next) => {
        const { page } = req.body
        const { userId } = req.params

        try {
            const articles = await ArticlesService.getAllFollowerArticles(
                req.app.get('db'),
                userId,
                page
            )
            res.status(200).json(articles)
        } catch(error) {
            next(error)
        }
    })


module.exports = ArticlesRouter