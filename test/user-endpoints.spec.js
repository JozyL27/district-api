const app = require('../src/app')
const helpers = require('./test-helpers')

describe(`Users endpoint`, () => {
    let db

    before('make knex instance', () => {
        db = helpers.makeKnexInstance()
        app.set('db', db)
    })

    after('disconnect from db', () => db.destroy())

    before('cleanup', () => helpers.cleanTables(db))

    afterEach('cleanup', () => helpers.cleanTables(db))

    describe(`POST /api/user`, () => {
        describe(`Given a valid user`, () => {
            it(`responds with 201, serialized user with hashed password`, () => {
                const newUser = {
                    email: 'tester123@test.com',
                    password: '#Password69',
                    username: 'Zelda',
                }

                return supertest(app)
                    .post('/api/user')
                    .send(newUser)
                    .expect(201)
                    .expect(res => {
                        expect(res.body).to.have.property('id')
                        expect(res.body.username).to.eql(newUser.username)
                        expect(res.body.email).to.eql(newUser.email)
                        expect(res.body).to.have.property('password')
                        expect(res.headers.location).to.eql(`/api/user/${res.body.id}`)
                    })
            })
        })
    })
})