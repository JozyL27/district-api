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
  getAllFollowers(db, user_id, page = 1) {
    const usersPerPage = 20;
    const offset = usersPerPage * (page - 1);

    return db("user_followers")
      .select("*")
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
};

module.exports = FollowersService;
