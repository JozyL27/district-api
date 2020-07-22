const express = require('express')

const jsonBodyParser = express.json()
const ArticlesRouter = express.Router()

ArticlesRouter
    .route('/categories')
    .get()


module.exports = ArticlesRouter