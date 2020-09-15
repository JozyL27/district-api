const express = require("express");
const ArticlesService = require("./articles-service");
const path = require("path");
const cloudinary = require("cloudinary");

const jsonBodyParser = express.json();
const ArticlesRouter = express.Router();
cloudinary.config({
  cloud_name: process.env.CLOUD_NAME,
  api_key: process.env.API_KEY,
  api_secret: process.env.API_SECRET,
});

ArticlesRouter.route("/categories").get(async (req, res, next) => {
  try {
    const categories = await ArticlesService.getCategories(req.app.get("db"));
    if (categories.length == 0) {
      res.status(400).json({ error: "uh oh! There are no categories left." });
    }
    if (!categories) {
      res.status(400).json({ error: "No categories were found." });
    }
    res.status(200).json(categories.rows);
  } catch (error) {
    next(error);
  }
});

ArticlesRouter.route("/popular").get(async (req, res, next) => {
  const { page } = req.query;
  try {
    const articles = await ArticlesService.getPopularArticles(
      req.app.get("db"),
      page
    );
    if (articles.length == 0) {
      res.status(400).json({ error: "uh oh! There are no articles left." });
    }
    if (!articles) {
      res.status(400).json({ error: "No articles were found." });
    }
    res.status(200).json(articles);
  } catch (error) {
    next(error);
  }
});

ArticlesRouter.route("/latest").get(async (req, res, next) => {
  const { page } = req.query;
  try {
    const articles = await ArticlesService.getMostRecentArticles(
      req.app.get("db"),
      page
    );
    if (!articles || articles.length < 1) {
      res.status(400).json({ error: "No articles were found." });
    }
    res.status(200).json(articles);
  } catch (error) {
    next(error);
  }
});

ArticlesRouter.route("/upvoted/:userId").get(async (req, res, next) => {
  const { userId } = req.params;
  const { page } = req.query;

  try {
    const articles = await ArticlesService.getUpvotedArticles(
      req.app.get("db"),
      userId,
      page
    );
    if (!articles || articles.length === 0) {
      res.status(400).json({ error: "No articles were found." });
    }

    res.status(200).json(articles);
  } catch (error) {
    next(error);
  }
});

ArticlesRouter.route("/")
  .get(async (req, res, next) => {
    const { page } = req.query;
    try {
      const articles = await ArticlesService.getAllArticles(
        req.app.get("db"),
        page
      );
      if (articles.length == 0) {
        res.status(400).json({ error: "uh oh! There are no articles left." });
      }
      if (!articles) {
        res.status(400).json({ error: "No articles were found." });
      }
      res.status(200).json(articles);
    } catch (error) {
      next(error);
    }
  })
  .post(jsonBodyParser, async (req, res, next) => {
    const { title, content, date_published, author, style, upvotes } = req.body;

    const newArticle = { title, content, author, style };

    try {
      for (const [key, value] of Object.entries(newArticle))
        if (value == null)
          return res.status(400).json({
            error: `Missing '${key}' in request body.`,
          });

      if (title.length < 4) {
        return res.status(400).json({
          error: "Article title must be at least 4 characters long.",
        });
      }

      if (style.length < 1) {
        return res.status(400).json({
          error: "Article must have a category.",
        });
      }

      if (content.length > 500) {
        return res.status(400).json({
          error: "Content must not exceed 500 characters.",
        });
      }

      // content should not exceed a certain number of characters.
      newArticle.date_published = date_published;
      newArticle.upvotes = upvotes;

      const article = await ArticlesService.insertArticle(
        req.app.get("db"),
        newArticle
      );

      res
        .status(201)
        .location(path.posix.join(req.originalUrl, `/${article.id}`))
        .json(ArticlesService.serializeArticle(article));
    } catch (error) {
      next(error);
    }
  });

ArticlesRouter.route("/:articleId")
  .get(async (req, res, next) => {
    const { articleId } = req.params;
    try {
      const article = await ArticlesService.getArticleById(
        req.app.get("db"),
        articleId
      );
      if (!article) {
        return res.status(404).json({
          error: "Article does not exist.",
        });
      }
      const userInfo = await ArticlesService.getAuthorInfo(
        req.app.get("db"),
        article.author
      );

      res
        .status(200)
        .json({ ...ArticlesService.serializeArticle(article), ...userInfo });
    } catch (error) {
      next(error);
    }
  })
  .delete(async (req, res, next) => {
    const { articleId } = req.params;

    try {
      await ArticlesService.deleteArticle(req.app.get("db"), articleId);

      res.status(204).end();
    } catch (error) {
      next(error);
    }
  })
  .patch(jsonBodyParser, async (req, res, next) => {
    const { articleId } = req.params;
    const { title, content } = req.body;
    const articleToUpdate = { title, content };

    try {
      const numberOfValues = Object.values(articleToUpdate).filter(Boolean)
        .length;
      if (numberOfValues === 0)
        return res.status(400).json({
          error: `Request body must contain either 'title' or 'content'`,
        });
      await ArticlesService.updateArticle(
        req.app.get("db"),
        articleId,
        articleToUpdate
      );

      res.status(204).end();
    } catch (error) {
      next(error);
    }
  });

ArticlesRouter.route("/category/:categoryId").get(async (req, res, next) => {
  let { categoryId } = req.params;
  const { page } = req.query;

  try {
    const articles = await ArticlesService.getArticlesByCategory(
      req.app.get("db"),
      categoryId,
      page
    );
    if (!articles) {
      res.status(400).json({ error: "No articles were found." });
    }
    if (articles.length === 0) {
      res.status(400).json({ error: `There are no ${categoryId} articles.` });
    }
    res.status(200).json(articles);
  } catch (error) {
    next(error);
  }
});

ArticlesRouter.route("/userarticles/:userId").get(async (req, res, next) => {
  const { page } = req.query;
  const { userId } = req.params;

  try {
    const articles = await ArticlesService.getAllUserArticles(
      req.app.get("db"),
      userId,
      page
    );
    if (articles.length == 0) {
      res.status(400).json({ error: "You have no articles." });
    }
    if (!articles) {
      res.status(400).json({ error: "No articles were found." });
    }
    res.status(200).json(articles);
  } catch (error) {
    next(error);
  }
});

ArticlesRouter.route("/feed/:userId").get(async (req, res, next) => {
  const { page } = req.query;
  const { userId } = req.params;

  try {
    let articles = await ArticlesService.getAllFollowerArticles(
      req.app.get("db"),
      userId,
      page
    );

    if (articles.length < 1) {
      articles = await ArticlesService.getAllUserArticles(
        req.app.get("db"),
        userId,
        page
      );

      if (articles.length < 1) {
        return res.status(400).json({
          error: "You have no articles in your feed.",
        });
      }

      await Promise.all(
        articles.map(
          async (article) =>
            (article.userInfo = await ArticlesService.getAuthorInfo(
              req.app.get("db"),
              article.author
            ))
        )
      );

      return res.status(200).json(articles);
    }

    await Promise.all(
      articles.map(
        async (article) =>
          (article.userInfo = await ArticlesService.getAuthorInfo(
            req.app.get("db"),
            article.author
          ))
      )
    );

    res.status(200).json(articles);
  } catch (error) {
    next(error);
  }
});

ArticlesRouter.route("/images").post(async (req, res, next) => {
  const values = Object.values(req.files);
  const types = ["image/png", "image/jpeg"];
  if (!types.includes(values[0].type)) {
    return res.status(400).json({
      error: `${values[0].type} is an unsupported file type.`,
    });
  }
  if (values[0].size > 2000000) {
    return res.status(400).json({
      error: "image size cannot exceed 2mbs",
    });
  }

  const promises = values.map((image) =>
    cloudinary.uploader.upload(image.path)
  );
  try {
    const imgData = await Promise.all(promises);
    const imgDataToStore = imgData[0].secure_url;

    res.status(201).json(imgDataToStore);
  } catch (error) {
    next(error);
  }
});

module.exports = ArticlesRouter;
