const bcrypt = require('bcryptjs')
const xss = require('xss')

const REGEX_UPPER_LOWER_NUMBER_SPECIAL = /(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#\$%\^&])[\S]+/

const UserService = {
    hasUserWithUserName(db, username) {
        return db('district_users')
        .where({ username })
        .first()
        .then(user => !!user)
    },
    insertUser(db, newUser) {
        return db
        .insert(newUser)
        .into('district_users')
        .returning('*')
        .then(([user]) => user)
    },
    validatePassword(password) {
        if (password.length < 8) {
            return 'Password should be longer than 8 characters'
        }

        if (password.length > 72) {
            return 'Password should be less than 72 characters'
        }

        if (password.startsWith(' ') || password.endsWith(' ')) {
            return 'Password must not start or end with empty spaces'
        }

        if (!REGEX_UPPER_LOWER_NUMBER_SPECIAL.test(password)) {
            return 'Password must contain one upper case, lower case, number, and special character'
        }
        return null
    },
    hashPassword(password) {
        // serialize password first
        password = xss(password)
        return bcrypt.hash(password, 12)
    },
    serializeUser(user) {
        return {
            id: user.id,
            email: xss(user.email),
            username: xss(user.username),
            password: user.password,
        }
    },
    updateUserInfo(db, id, updateUserInfo) {
        return db('district_users')
        .where('district_users.id', id)
        .update(updateUserInfo)
    },
}

module.exports = UserService