const ArticlesService = {
    getCategories(db) {
        return db.raw('SELECT unnest(enum_range(NULL::article_category))::text AS category')
    },
}

module.exports = ArticlesService