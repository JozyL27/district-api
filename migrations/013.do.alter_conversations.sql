ALTER TABLE conversations 
    ADD COLUMN
        conversation_created TIMESTAMP DEFAULT now() NOT NULL;