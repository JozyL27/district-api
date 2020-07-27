const express = require('express')
const ArticlesService = require('./articles-service')
const path = require('path')

const jsonBodyParser = express.json()
const ArticlesRouter = express.Router()
// post an article, get all articles from people you follow, article comment button added to frontend

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
    .get(async (req, res, next) => {
        const { page } = req.query
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
    .get(async (req, res, next) => {
        const { page } = req.query
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
    .post(jsonBodyParser, async (req, res, next) => {
        const { title, content, 
            date_published, author, 
            style, upvotes } = req.body

        const newArticle = { title, content, 
            author, style }

        try {
            for(const [key, value] of Object.entries(newArticle))
                if(value == null)
                    return res.status(400).json({
                        error: `Missing '${key}' in request body.`
                    })

            newArticle.date_published = date_published
            newArticle.upvotes = upvotes

            const article = await ArticlesService.insertArticle(
                req.app.get('db'),
                newArticle
            )

            res
                .status(201)
                .location(path.posix.join(req.originalUrl, `/${article.id}`))
                .json(ArticlesService.serializeArticle(article))
        } catch(error) {
            next(error)
        }
    })

ArticlesRouter
    .route('/:articleId')
    .get(async (req, res, next) => {
        const { articleId } = req.params
        try {
            const article  = await ArticlesService.getArticleById(
                req.app.get('db'),
                articleId
            )

            if(!article) {
                return res.status(404).json({
                    error: 'Article does not exist.'
                })
            }

            res.status(200).json(ArticlesService.serializeArticle(article))
        } catch(error) {
            next(error)
        }
    })
    .delete(async (req, res, next) => {
        const { articleId } = req.params

        try {
            await ArticlesService.deleteArticle(
                req.app.get('db'),
                articleId
            )

            res.status(204).end()
        } catch(error) {
            next(error)
        }
    })
    .patch(jsonBodyParser, async (req, res, next) => {
        const { articleId } = req.params
        const { title, content } = req.body
        const articleToUpdate = { title, content }

        const numberOfValues = Object.values(articleToUpdate).filter(Boolean).length
        if (numberOfValues === 0)
            return res.status(400).json({ error: `Request body must contain either 'title' or 'content'` })

        try {
             await ArticlesService.updateArticle(
                req.app.get('db'),
                articleId,
                articleToUpdate
            )

            res.status(204).end()
        } catch(error) {
            next(error)
        }
    })

ArticlesRouter
    .route('/:articleId/comments')
    .get(async (req, res, next) => {
        const { articleId } = req.params
        const { page } = req.query
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
    .get(async (req, res, next) => {
        let { categoryId } = req.params
        const { page } = req.query

        try {
            const articles = await ArticlesService.getArticlesByCategory(
                req.app.get('db'),
                categoryId,
                page
            )
            if(articles.length == 0) {
                res.status(400).json({ error: 'There are no more articles under this category.' })
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
    .get(async (req, res, next) => {
        const { page } = req.query

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
    .get(async (req, res, next) => {
        const { page } = req.query
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
    .get(async (req, res, next) => {
        const { page } = req.query
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