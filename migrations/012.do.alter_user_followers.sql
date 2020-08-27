ALTER TABLE user_followers 
    ADD COLUMN
        followed_user_on TIMESTAMP DEFAULT now() NOT NULL;