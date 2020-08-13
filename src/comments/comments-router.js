const express = require('express')
const CommentService = require('./comments-service')
const path = require('path')

const JsonBodyParser = express.json()
const CommentsRouter = express.Router()


CommentsRouter
    .route('/')
    .post(JsonBodyParser, async (req, res, next) => {
        const { text, date_commented, user_id, article_id } = req.body
        const newComment = { text, article_id, user_id }

        try {
            for(const [key, value] of Object.entries(newComment))
                if(value == null)
                    return res.status(400).json({
                        error: `Missing '${key}' in request body.`
                    })
            
            if(text.length < 1) {
                return res.status(400)
                .json({ error: `Comment body cannot be empty.` })
            }
            if(text.length > 250) {
                return res.status(400)
                .json({ error: 'Comments cannot exceed 250 characters.' })
            }

            newComment.date_commented = date_commented

            const comment = await CommentService.insertComment(
                req.app.get('db'),
                newComment
            )

            res
                .status(201)
                .location(path.posix.join(req.originalUrl, `/${comment.id}`))
                .json(CommentService.serializeComment(comment))
        } catch(error) {
            next(error)
        }
    })


CommentsRouter
    .route('/:commentId')
    .get(async (req, res, next) => {
        const { commentId } = req.params

        try {
            const comment = await CommentService.getCommentById(
                req.app.get('db'),
                commentId
            )
            if(!comment.id) {
                return res.status(400).json({ error: 'No comment found. '})
            }

            res.status(200).json(comment)
        } catch(error) {
            next(error)
        }
    })
    .delete(async (req, res, next) => {
        const { commentId } = req.params

        try {
            await CommentService.deleteComment(
                req.app.get('db'),
                commentId
            )

            res.status(204).end()
        } catch(error) {
            next(error)
        }
    })
    .patch(JsonBodyParser, async (req, res, next) => {
        const { commentId } = req.params
        const { text } = req.body
        const commentToUpdate = { text }

        const numberOfValues = Object.values(commentToUpdate).filter(Boolean).length
        if (numberOfValues === 0)
            return res.status(400).json({ error: `Request body must contain 'text'` })

        if(text.length > 250) {
            return res.status(400)
            .json({ error: 'Comments cannot exceed 250 characters.' })
        }
        if(text.length < 1) {
            return res.status(400)
            .json({ error: `Comment body cannot be empty.` })
        }
        try {
            await CommentService.updateComment(
                req.app.get('db'),
                commentId,
                commentToUpdate
            )

            res.status(204).end()
        } catch(error) {
            next(error)
        }
    })


CommentsRouter
    .route('/article/:articleId')
    .get(async (req, res, next) => {
        const { articleId } = req.params
        const { page } = req.query
        try {
            const comments = await CommentService.getArticleComments(
                req.app.get('db'),
                articleId,
                page
            )
            if(comments.length == 0 && page > 1) {
                res.status(400).json({ error: 'No more comments are available.' })
            }
            if(comments.length === 0) {
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