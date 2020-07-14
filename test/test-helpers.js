const knex = require('knex')
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')

function makeKnexInstance() {
    return knex({
        client: 'pg',
        connection: process.env.TEST_DB_URL,
    })
}

function makeUser() {
    return {
        id: 1,
        username: 'Zelda',
        email: 'zelda@gmail.com',
        password: '#Link1234'
    }
}

function makeUsersArray() {
    return [{
        id: 1,
        username: 'Zelda',
        email: 'zelda@gmail.com',
        password: '#Link1234'
    },
    {
        id: 2,
        username: 'test-user-2',
        email: 'test@test.com',
        password: '#Password69',
      },
    ]
}

function cleanTables(db) {
    return db.transaction(trx => 
        trx.raw(
            `TRUNCATE
                "district_users",
                "district_articles",
                "district_comments",
                "user_followers",
                "conversations",
                "messages"`
        )
        .then(() => 
            Promise.all([
                trx.raw(`ALTER SEQUENCE district_users_id_seq minvalue 0 START WITH 1`),
                trx.raw(`SELECT setval('district_users_id_seq', 0)`)
            ])
        )
    )
}

/**
 * make a bearer token with jwt for authorization header
 * @param {object} user - contains `id`, `username`
 * @param {string} secret - used to create the JWT
 * @returns {string} - for HTTP authorization header
 */
function makeAuthHeader (user, secret = process.env.JWT_SECRET) {
    const token = jwt.sign({ user_id: user.id }, secret, {
        subject: user.username,
        algorithm: 'HS256',
    })
    return `Bearer ${token}`
}

/**
 * insert users into db with bcrypted passwords and update sequence
 * @param {knex instance} db
 * @param {array} users - array of user objects for insertion
 * @returns {Promise} - when users table seeded
 */
function seedUsers(db, users) {
    const preppedUsers = users.map(user => ({
        ...user,
        password: bcrypt.hashSync(user.password, 1)
    }))

    return db.transaction(async trx => {
        await trx.into('district_users').insert(preppedUsers)

        await trx.raw(
            `SELECT setval('district_users_id_seq', ?)`,
            [users[users.length - 1].id],
        )
    })
}

module.exports = {
    makeKnexInstance,
    cleanTables,
    makeUser,
    makeAuthHeader,
    seedUsers,
    makeUsersArray,
}