const bcrypt = require('bcryptjs')

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
            return 'Password must contain one upper case, lower case, number and special character'
        }
        return null
    },
    hashPassword(password) {
        return bcrypt.hash(password, 12)
    },
    serializeUser(user) {
        return {
            id: user.id,
            email: user.email,
            username: user.username,
        }
    },
}

module.exports = UserService