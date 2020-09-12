const express = require("express");
const FollowersService = require("./followers-service");
const JsonBodyParser = express.json();
const FollowersRouter = express.Router();

FollowersRouter.route("/")
  .post(JsonBodyParser, async (req, res, next) => {
    const { user_id, follower_id } = req.body;
    const newFollower = { user_id, follower_id };

    try {
      for (const [key, value] of Object.entries(newFollower))
        if (value == null)
          return res.status(400).json({
            error: `Missing '${key}' in request body`,
          });

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
  })
  .delete(JsonBodyParser, async (req, res, next) => {
    const { user_id, follower_id } = req.body;
    try {
      await FollowersService.unfollowUser(
        req.app.get("db"),
        user_id,
        follower_id
      );

      res.status(204).end();
    } catch (error) {
      next(error);
    }
  });

FollowersRouter.route("/userfollowing/:userId").get(async (req, res, next) => {
  const { userId } = req.params;
  const { page } = req.query;

  try {
    const following = await FollowersService.getAllFollowing(
      req.app.get("db"),
      userId,
      page
    );
    if (following.length < 1) {
      return res.status(400).json({
        error: "You do not follow anyone.",
      });
    }
    res.status(200).json(following);
  } catch (error) {
    next(error);
  }
});

FollowersRouter.route("/userfollowers/:user_id").get(async (req, res, next) => {
  const { user_id } = req.params;
  const page = req.query;

  try {
    const followers = await FollowersService.getAllFollowers(
      req.app.get("db"),
      user_id,
      page
    );

    if (followers.length < 1) {
      return res.status(400).json({
        error: "You have no followers.",
      });
    }

    res.status(200).json(followers);
  } catch (error) {
    next(error);
  }
});

FollowersRouter.route("/count/:user_id").get(async (req, res, next) => {
  const { user_id } = req.params;

  try {
    const followingCount = await FollowersService.getFollowingCount(
      req.app.get("db"),
      user_id
    );
    const followersCount = await FollowersService.getFollowersCount(
      req.app.get("db"),
      user_id
    );

    res.status(200).json([...followingCount, ...followersCount]);
  } catch (error) {
    next(error);
  }
});

FollowersRouter.route("/:user_id").get(async (req, res, next) => {
  const { user_id } = req.params;
  const { follower_id } = req.query;

  try {
    const alreadyAFollower = await FollowersService.alreadyFollowing(
      req.app.get("db"),
      user_id,
      follower_id
    );
    if (alreadyAFollower) {
      return res.status(200).json({ message: true });
    } else {
      return res.status(200).json({ message: false });
    }
  } catch (error) {
    next(error);
  }
});

module.exports = FollowersRouter;
