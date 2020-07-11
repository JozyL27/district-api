CREATE TABLE district_comments (
    id INTEGER PRIMARY KEY GENERATED BY DEFAULT AS IDENTITY,
    text TEXT NOT NULL,
    date_commented TIMESTAMP DEFAULT now() NOT NULL,
    article_id INTEGER
        REFERENCES district_articles(id) ON DELETE CASCADE NOT NULL,
    user_id INTEGER
        REFERENCES district_users(id) ON DELETE CASCADE NOT NULL
);