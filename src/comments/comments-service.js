const xss = require("xss");

const CommentService = {
  getArticleComments(db, articleId, page = 1) {
    const commentsPerpage = 12;
    const offset = commentsPerpage * (page - 1);

    return db("district_comments")
      .select(
        "text",
        "date_commented",
        "article_id",
        "user_id",
        "username",
        "avatar",
        "district_comments.id"
      )
      .orderBy("date_commented", "desc")
      .innerJoin(
        "district_users",
        "district_comments.user_id",
        "district_users.id"
      )
      .where("district_comments.article_id", articleId)
      .limit(commentsPerpage)
      .offset(offset);
  },
  insertComment(db, newComment) {
    return db("district_comments")
      .insert(newComment)
      .returning("*")
      .then((rows) => {
        return rows[0];
      });
  },
  updateComment(db, id, newCommentFields) {
    return db("district_comments").where({ id }).update(newCommentFields);
  },
  deleteComment(db, id) {
    return db("district_comments").where({ id }).delete();
  },
  serializeComment(comment) {
    return {
      id: comment.id,
      text: xss(comment.text),
      date_commented: comment.date_commented,
      article_id: comment.article_id,
      user_id: comment.user_id,
    };
  },
  getCommentById(db, id) {
    return db("district_comments")
      .select("*")
      .where("district_comments.id", id)
      .first();
  },
};

module.exports = CommentService;
