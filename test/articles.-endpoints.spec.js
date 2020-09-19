const app = require("../src/app");
const helpers = require("./test-helpers");
const supertest = require("supertest");
const { expect } = require("chai");

describe("Articles endpoints", () => {
  let db;
  const testUsers = helpers.makeUsersArray();
  const testArticles = helpers.makeArticlesArray();

  before("make knex instance", () => {
    db = helpers.makeKnexInstance();
    app.set("db", db);
  });

  after("disconnect from db", () => db.destroy());

  before("cleanup", () => helpers.cleanTables(db));

  afterEach("cleanup", () => helpers.cleanTables(db));

  describe("/api/articles/categories", () => {
    it("responds with 200 and an array of objects", () => {
      return supertest(app)
        .get("/api/articles/categories")
        .expect(200)
        .expect((res) => {
          expect(res.body).to.be.an("array");
          expect(res.body[0]).to.be.an("object");
          expect(res.body[0]).to.have.property("category");
        });
    });
  });

  describe("/api/articles/popular", () => {
    before("insert articles", () =>
      helpers.seedUsersArticles(db, testUsers, testArticles)
    );
    it("responds with 200 and an array of articles", () => {
      return supertest(app)
        .get("/api/articles/popular")
        .expect(200)
        .expect((res) => {
          expect(res.body[0]).to.have.keys(
            "title",
            "author",
            "avatar",
            "content",
            "upvotes",
            "username",
            "date_published",
            "style",
            "id"
          );
        });
    });

    it("responds with 400 if there are no articles", () => {
      return supertest(app).get("/api/articles/popular").expect(400, {
        error: "uh oh! There are no articles left.",
      });
    });
  });
});
