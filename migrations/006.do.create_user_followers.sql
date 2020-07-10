CREATE TABLE user_followers (
    user_id INTEGER NOT NULL REFERENCES district_users(id) ON DELETE CASCADE NOT NULL,
    follower_id INTEGER NOT NULL REFERENCES district_users(id) ON DELETE CASCADE NOT NULL
);