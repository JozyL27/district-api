const knex = require('knex')

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

module.exports = {
    makeKnexInstance,
    cleanTables,
    makeUser,
}