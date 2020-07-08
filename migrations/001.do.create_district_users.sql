CREATE TABLE district_users (
    id INTEGER PRIMARY KEY GENERATED BY DEFAULT AS IDENTITY,
    username TEXT NOT NULL UNIQUE,
    password TEXT NOT NULL,
    email TEXT NOT NULL,
    avatar TEXT,
    bio TEXT,
    date_created TIMESTAMP NOT NULL default now()
);