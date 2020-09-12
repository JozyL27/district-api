const UpvoteService = {
  upvoteArticle(db, newVote) {
    return db("user_votes")
      .insert(newVote)
      .returning("*")
      .then(([vote]) => vote);
  },
  updateArticleUpvotes(db, articleId, newValue) {
    return db("district_articles")
      .update("upvotes", newValue)
      .where("id", articleId);
  },
  hasUpvoted(db, userId, articleId) {
    return db("user_votes")
      .select("*")
      .where("user_votes.user_id", userId)
      .andWhere("user_votes.article_id", articleId)
      .first();
  },
  getArticleUpvotes(db, articleId) {
    return db("district_articles")
      .select("upvotes")
      .where("id", articleId)
      .then(([upvotes]) => upvotes);
  },
  getArticleLikeInfo(db, articleId, page = 1) {
    const usersPerPage = 12;
    const offset = usersPerPage * (page - 1);

    return db("user_votes")
      .select(
        "user_votes.user_id",
        "user_votes.article_id",
        "district_users.username",
        "district_users.avatar"
      )
      .innerJoin("district_users", "user_votes.user_id", "district_users.id")
      .where("user_votes.article_id", articleId)
      .limit(usersPerPage)
      .offset(offset);
  },
};

module.exports = UpvoteService;
