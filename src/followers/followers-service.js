const FollowersService = {
  addFollower(db, newFollower) {
    return db("user_followers")
      .insert(newFollower)
      .returning("*")
      .then((rows) => {
        return rows[0];
      });
  },
  alreadyFollowing(db, user_id, follower_id) {
    return db("user_followers")
      .select("*")
      .where("user_followers.user_id", user_id)
      .andWhere("user_followers.follower_id", follower_id)
      .first();
  },
  getAllFollowing(db, user_id, page = 1) {
    const usersPerPage = 20;
    const offset = usersPerPage * (page - 1);

    return db("user_followers")
      .select(
        "user_followers.user_id",
        "user_followers.follower_id",
        "user_followers.followed_user_on",
        "district_users.id",
        "district_users.username",
        "district_users.avatar",
        "district_users.bio",
        "district_users.date_created as user_account_created_on"
      )
      .where("user_followers.user_id", user_id)
      .innerJoin(
        "district_users",
        "user_followers.follower_id",
        "district_users.id"
      )
      .orderBy("followed_user_on", "desc")
      .limit(usersPerPage)
      .offset(offset);
  },
  getAllFollowers(db, user_id, page = 1) {
    const usersPerPage = 20;
    const offset = usersPerPage * (page - 1);

    return db("user_followers")
      .select(
        "user_followers.user_id",
        "user_followers.follower_id",
        "user_followers.followed_user_on",
        "district_users.id",
        "district_users.username",
        "district_users.avatar",
        "district_users.bio",
        "district_users.date_created as user_account_created_on"
      )
      .where("user_followers.follower_id", user_id)
      .innerJoin(
        "district_users",
        "user_followers.user_id",
        "district_users.id"
      )
      .orderBy("followed_user_on", "desc")
      .limit(usersPerPage)
      .offset(offset);
  },
  getFollowingCount(db, user_id) {
    return db("user_followers")
      .count({ following_count: "user_followers.follower_id" })
      .where("user_followers.user_id", user_id);
  },
  getFollowersCount(db, user_id) {
    return db("user_followers")
      .count({ followers_count: "user_followers.follower_id" })
      .where("user_followers.follower_id", user_id);
  },
  unfollowUser(db, user_id, follower_id) {
    return db("user_followers")
      .where({ user_id: user_id, follower_id: follower_id })
      .delete();
  },
};

module.exports = FollowersService;
