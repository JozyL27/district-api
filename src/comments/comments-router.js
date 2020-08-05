const express = require('express')
const CommentService = require('./comments-service')

const JsonBodyParser = express.json()
const CommentsRouter = express.Router()


CommentsRouter
    .route('/:articleId')
    .get(async (req, res, next) => {
        const { articleId } = req.params
        const { page } = req.query
        try {
            const comments = await CommentService.getArticleComments(
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


module.exports = CommentsRouter