const express = require('express')
const AuthService = require('./auth-service')
const { requireAuth } = require('../middleware/jwt-auth')

const AuthRouter = express.Router()
const jsonBodyParser = express.json()

AuthRouter
.route('/token')
.post(jsonBodyParser, async (req, res, next) => {})