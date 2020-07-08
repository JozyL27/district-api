ALTER TABLE district_articles
    ADD COLUMN
    author INTEGER REFERENCES district_users(id)
    ON DELETE SET NULL;