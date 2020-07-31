const UpvoteService = {
    upvoteArticle(db, newVote) {
        return db('user_votes')
        .insert(newVote)
        .returning('*')
        .then(([vote]) => vote)
    },
    updateArticleUpvotes(db, articleId, newValue) {
        return db('district_articles')
        .update('upvotes', newValue)
        .where('id', articleId)
    },
    hasUpvoted(db, userId, articleId) {
        return db('user_votes')
        .select('*')
        .where('user_votes.user_id', userId)
        .andWhere('user_votes.article_id', articleId)
        .first()
    },
    getArticleUpvotes(db, articleId) {
        return db('district_articles')
        .select('upvotes')
        .where('id', articleId)
        .then(([upvotes]) => upvotes)
    },
}

module.exports = UpvoteService