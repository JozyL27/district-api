const express = require('express')
const path = require('path')
const UserService = require('./user-service')

const UserRouter = express.Router()
const jsonBodyParser = express.json()

UserRouter
    .route('/')
    .post(jsonBodyParser, async (req, res, next) => {
        const { password, username, email } = req.body

        for (const field of ['password', 'username', 'email'])
            if (!req.body[field])
            return res.status(400).json({
                error: `Missing '${field}' in request body`
            })

        try {
            const passwordError = UserService.validatePassword(password)

            if (passwordError)
                return res.status(400).json({ error: passwordError })
            
            const hasUserWithUserName = await UserService.hasUserWithUserName(
                req.app.get('db'),
                username
            )

            if (hasUserWithUserName)
                return res.status(400).json({ error: `Username already taken` })
            
            const hashedPassword = await UserService.hashPassword(password)

            const newUser = {
                username,
                password: hashedPassword,
                email,
            }

            const user = await UserService.insertUser(
                req.app.get('db'),
                newUser
            )

            res
                .status(201)
                .location(path.posix.join(req.originalUrl, `/${user.id}`))
                .json(UserService.serializeUser(user))
        } catch(error) {
            next(error)
        }
    })

UserRouter
    .route('/:userId')
    .get(async (req, res, next) => {
        const { userId } = req.params

        try {
            const userInfo = await UserService.getUserInfo(
                req.app.get('db'),
                userId
            )
            if(!userInfo) {
                return res.status(400).json({
                    error: 'No user info was found.'
                })
            }

            res.status(200).json(userInfo)
        } catch(error) {
            next(error)
        }
    })

    module.exports = UserRouter