CREATE TABLE messages (
    id SERIAL NOT NULL PRIMARY KEY,
    conversation_id INTEGER NOT NULL REFERENCES conversations(id),
    sender_id INTEGER NOT NULL REFERENCES district_users(id),
    message TEXT
);