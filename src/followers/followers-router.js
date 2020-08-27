const express = require("express");
const FollowersService = require("./followers-service");
const JsonBodyParser = express.json();
const FollowersRouter = express.Router();

FollowersRouter.route("/").post(JsonBodyParser, async (req, res, next) => {
  const { user_id, follower_id } = req.body;
  const newFollower = { user_id, follower_id };

  try {
    const alreadyAFollower = await FollowersService.alreadyFollowing(
      req.app.get("db"),
      user_id,
      follower_id
    );
    if (alreadyAFollower) {
      return res.status(400).json({ error: "You already follow this user." });
    }
    const newFollowerInfo = await FollowersService.addFollower(
      req.app.get("db"),
      newFollower
    );

    res.status(201).json(newFollowerInfo);
  } catch (error) {
    next(error);
  }
});

module.exports = FollowersRouter;
