const knex = require("knex");

const { DB_URL } = require("../config");
const db = knex({
  client: "pg",
  connection: DB_URL,
});

const MessageService = {
  findOrCreateConversation(user1id, user2id) {
    return db.transaction((trx) => {
      trx("conversations")
        .where("user1id", "in", [user1id, user2id])
        .andWhere("user2id", "in", [user1id, user2id])
        .first()
        .then((conversation) => {
          if (conversation) {
            return conversation;
          } else {
            return trx("conversations")
              .insert({
                user1id,
                user2id,
              })
              .returning("*")
              .then(([newConversation]) => {
                return newConversation;
              });
          }
        })
        .then(trx.commit)
        .catch(trx.rollback);
    });
  },

  createMessage(message, sender_id, receiver_id) {
    return this.findOrCreateConversation(sender_id, receiver_id).then(
      (conversation) => {
        return db("messages")
          .insert({
            conversation_id: conversation.id,
            sender_id,
            message,
          })
          .returning("*")
          .then(([newMessage]) => {
            return newMessage;
          });
      }
    );
  },

  getMessagesForConversation(conversation_id, page = 1) {
    const messagesPerPage = 12;
    const offset = messagesPerPage * (page - 1);

    return db("messages")
      .select("*")
      .where({ conversation_id })
      .orderBy("date_created", "asc")
      .limit(messagesPerPage)
      .offset(offset);
  },
};

module.exports = MessageService;
