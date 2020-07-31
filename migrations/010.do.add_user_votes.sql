CREATE TABLE user_votes (
    article_id INTEGER
        REFERENCES district_articles(id) ON DELETE CASCADE NOT NULL,
    user_id INTEGER
        REFERENCES district_users(id) ON DELETE CASCADE NOT NULL,
    PRIMARY KEY (user_id, article_id)
);