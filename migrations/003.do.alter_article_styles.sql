CREATE TYPE article_category AS ENUM (
    'How-to',
    'Streetwear',
    'Avant Garde',
    'Minimalist',
    'Tech Wear',
    'Vintage',
    'Luxury',
    'Music',
    'Advice',
    'FOTD (Fit of The Day)',
    'Grail',
    'News',
    'Interview',
    'WomensWear',
    'Other'
);

ALTER TABLE district_articles
    ADD Column
        style article_category;