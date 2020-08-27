ALTER TABLE messages 
    ADD COLUMN
        date_created TIMESTAMP DEFAULT now() NOT NULL;