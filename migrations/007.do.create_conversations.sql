CREATE TABLE conversations (
    id SERIAL NOT NULL PRIMARY KEY,
    user1id INTEGER NOT NULL REFERENCES district_users(id) ON DELETE CASCADE,
    user2id INTEGER NOT NULL REFERENCES district_users(id) ON DELETE CASCADE
);