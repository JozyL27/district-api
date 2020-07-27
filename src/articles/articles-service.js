const xss = require('xss')

const ArticlesService = {
    getCategories(db) {
        return db.raw('SELECT unnest(enum_range(NULL::article_category))::text AS category')
    },
    getMostRecentArticles(db, page = 1) {
        const articlesPerPage = 9
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
    getAllUserArticles(db, userId, page = 1) {
        const articlesPerPage = 10
        const offset = articlesPerPage * (page -1)

        return db('district_articles')
        .select('*')
        .where('district_articles.author', userId)
        .orderBy('date_published', 'desc')
        .limit(articlesPerPage)
        .offset(offset)
    },
    getAllFollowerArticles(db, userId, page = 1) {
        const articlesPerPage = 10
        const offset = articlesPerPage * (page - 1)

        return db
        .from('user_followers')
        .select('follower_id', 'title', 
        'content', 'date_published', 
        'district_articles.id as article_id', 
        'district_articles.author', 
        'district_users.avatar', 'district_users.username')
        .innerJoin('district_articles', 'user_followers.follower_id', 'district_articles.author')
        .innerJoin('district_users', 'user_followers.follower_id', 'district_users.id')
        .where('user_followers.user_id', userId)
        .orderBy('date_published', 'desc')
        .limit(articlesPerPage)
        .offset(offset)
    },
    deleteArticle(db, articleId) {
        return db('district_articles')
        .where({ articleId })
        .delete()
    },
    updateArticle(db, articleId, newArticleFields) {
        return db('district_articles')
        .where({ articleId })
        .update(newArticleFields)
    },
    insertArticle(db, newArticle) {
        return db('district_articles')
        .insert(newArticle)
        .returning('*')
        .then(rows => {
            return rows[0]
        })
    },
    serializeArticle(article) {
        return {
            id: article.id,
            title: xss(article.title),
            content: xss(article.content),
            date_published: article.date_published,
            style: article.style,
            author: article.author,
            upvotes: article.upvotes
        }
    },
    getArticleById(db, id) {
        return db('district_articles')
        .select('*')
        .where('id', id)
        .first()
    },
}

module.exports = ArticlesService