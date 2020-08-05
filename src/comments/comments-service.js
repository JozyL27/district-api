const CommentService = {
    getArticleComments(db, articleId, page = 1) {
        const commentsPerpage = 12
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
}

module.exports = CommentService