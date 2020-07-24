const ArticlesService = {
    getCategories(db) {
        return db.raw('SELECT unnest(enum_range(NULL::article_category))::text AS category')
    },
    getMostRecentArticles(db, page = 1) {
        const articlesPerPage = 10
        const offset = articlesPerPage * (page - 1)

        return db('district_articles')
        .select('*')
        .orderBy('date_published', 'desc')
        .limit(articlesPerPage)
        .offset(offset)
    },
    getArticleComments(db, articleId, page = 1) {
        const commentsPerpage = 15
        const offset = commentsPerpage * (page - 1)

        return db('district_comments')
        .select('text', 'date_commented', 
        'article_id', 'user_id', 
        'username', 'avatar', 
        'district_comments.id')
        .orderBy('date_commented', 'desc')
        .innerJoin('district_users', 'district_comments.user_id', 'district_users.id')
        .where('district_comments.article_id', articleId)
        .limit(commentsPerpage)
        .offset(offset)
    },
    getAllArticles(db, page = 1) {
        const articlesPerPage = 10
        const offset = articlesPerPage * (page - 1)

        return db('district_articles')
        .select('*')
        .limit(articlesPerPage)
        .offset(offset)
    },
    getArticlesByCategory(db, category, page = 1) {
        const articlesPerPage = 10
        const offset = articlesPerPage * (page - 1)

        return db('district_articles')
        .select('*')
        .where('district_articles.style', category)
        .orderBy('upvotes', 'desc')
        .limit(articlesPerPage)
        .offset(offset)
    },
    getPopularArticles(db, page = 1) {
        const articlesPerPage = 10
        const offset = articlesPerPage * (page - 1)

        return db('district_articles')
        .select('*')
        .orderBy('upvotes', 'desc')
        .limit(articlesPerPage)
        .offset(offset)
    },
}

module.exports = ArticlesService