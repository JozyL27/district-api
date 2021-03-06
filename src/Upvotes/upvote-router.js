const express = require("express");
const UpvoteService = require("./upvote-service");
const { requireAuth } = require("../middleware/jwt-auth");

const JsonBodyParser = express.json();
const UpvoteRouter = express.Router();

UpvoteRouter.route("/:articleId").get(async (req, res, next) => {
  const { articleId } = req.params;

  try {
    const currentArticleValue = await UpvoteService.getArticleUpvotes(
      req.app.get("db"),
      articleId
    );
    res.status(200).json(currentArticleValue);
  } catch (error) {
    next(error);
  }
});

UpvoteRouter.route("/").post(
  requireAuth,
  JsonBodyParser,
  async (req, res, next) => {
    const { user_id, article_id } = req.body;
    const newUpvote = { user_id, article_id };

    try {
      for (const [key, value] of Object.entries(newUpvote))
        if (value == null)
          return res.status(400).json({
            error: `Missing '${key}' in request body.`,
          });

      const hasUpvoted = await UpvoteService.hasUpvoted(
        req.app.get("db"),
        user_id,
        article_id
      );
      if (hasUpvoted) {
        return res
          .status(400)
          .json({ error: `You have already upvoted this article.` });
      }

      // insert upvote to user upvotes table
      await UpvoteService.upvoteArticle(req.app.get("db"), newUpvote);

      // get article's current value and add one to it
      const currentArticleValue = await UpvoteService.getArticleUpvotes(
        req.app.get("db"),
        article_id
      );
      const newUpvoteValue = (currentArticleValue.upvotes += 1);

      await UpvoteService.updateArticleUpvotes(
        req.app.get("db"),
        article_id,
        newUpvoteValue
      );

      res.status(201).json({ message: `Upvoted!` });
    } catch (error) {
      next(error);
    }
  }
);

UpvoteRouter.route("/users/:articleId").get(async (req, res, next) => {
  const { articleId } = req.params;
  const { page } = req.query;
  try {
    const users = await UpvoteService.getArticleLikeInfo(
      req.app.get("db"),
      articleId,
      page
    );

    if (users.length < 1) {
      return res.status(400).json({
        error: "No one has liked this article",
      });
    }

    res.status(200).json(users);
  } catch (error) {
    next(error);
  }
});

module.exports = UpvoteRouter;
