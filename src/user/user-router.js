require("dotenv").config();
const express = require("express");
const path = require("path");
const cloudinary = require("cloudinary");
const UserService = require("./user-service");
const ArticlesService = require("../articles/articles-service");
const { requireAuth } = require("../middleware/jwt-auth");

const UserRouter = express.Router();
const jsonBodyParser = express.json();
cloudinary.config({
  cloud_name: process.env.CLOUD_NAME,
  api_key: process.env.API_KEY,
  api_secret: process.env.API_SECRET,
});

UserRouter.route("/").post(jsonBodyParser, async (req, res, next) => {
  const { password, username, email } = req.body;

  for (const field of ["password", "username", "email"])
    if (!req.body[field])
      return res.status(400).json({
        error: `Missing '${field}' in request body`,
      });

  try {
    const passwordError = UserService.validatePassword(password);

    if (passwordError) return res.status(400).json({ error: passwordError });

    const hasUserWithUserName = await UserService.hasUserWithUserName(
      req.app.get("db"),
      username
    );

    if (hasUserWithUserName)
      return res.status(400).json({ error: `Username already taken` });

    const hashedPassword = await UserService.hashPassword(password);

    const newUser = {
      username,
      password: hashedPassword,
      email,
    };

    const user = await UserService.insertUser(req.app.get("db"), newUser);

    res
      .status(201)
      .location(path.posix.join(req.originalUrl, `/${user.id}`))
      .json(UserService.serializeUser(user));
  } catch (error) {
    next(error);
  }
});

UserRouter.route("/:userId")
  .get(async (req, res, next) => {
    const { userId } = req.params;

    try {
      const userInfo = await ArticlesService.getAuthorInfo(
        req.app.get("db"),
        userId
      );
      if (!userInfo) {
        return res.status(400).json({
          error: "No user info was found.",
        });
      }

      res.status(200).json(userInfo);
    } catch (error) {
      next(error);
    }
  })
  .patch(jsonBodyParser, async (req, res, next) => {
    const { userId } = req.params;
    const { bio, username, avatar } = req.body;

    try {
      if (bio.length > 250) {
        return res.status(400).json({
          error: "Bio cannot exceed 250 characters.",
        });
      }

      const usernameError = UserService.vaidateUsername(username);

      if (usernameError) return res.status(400).json({ error: usernameError });

      const newUserInfo = { bio, username, avatar };

      const hasUserWithUserName = await UserService.hasUserWithUserName(
        req.app.get("db"),
        username
      );

      const userInfo = await ArticlesService.getAuthorInfo(
        req.app.get("db"),
        userId
      );

      if (hasUserWithUserName && userInfo.username !== username) {
        return res.status(400).json({
          error: "Username already taken.",
        });
      }

      await UserService.updateUserInfo(req.app.get("db"), userId, newUserInfo);

      res.status(204).end();
    } catch (error) {
      next(error);
    }
  });

UserRouter.route("/avatar").post(requireAuth, async (req, res, next) => {
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

module.exports = UserRouter;
