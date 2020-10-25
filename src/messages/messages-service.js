const knex = require("knex");
const { DATABASE_URL } = require("../config");

const db = knex({
  client: "pg",
  connection: DATABASE_URL,
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
  getMessagesForConversation(conversation_id) {
    return db("messages")
      .select("*")
      .where({ conversation_id })
      .orderBy("date_created", "asc");
  },
  getConverstations(db, user_id, page = 1) {
    const conversationsPerPage = 12;
    const offset = conversationsPerPage * (page - 1);

    return db("conversations")
      .select(
        "conversations.id",
        "conversations.user1id",
        "conversations.user2id",
        "conversations.conversation_created"
      )
      .where("conversations.user1id", user_id)
      .orWhere("conversations.user2id", user_id)
      .orderBy("conversation_created", "desc")
      .limit(conversationsPerPage)
      .offset(offset);
  },
  getLastMessageInConversation(db, conversation_id) {
    return db("conversations")
      .select("messages.sender_id", "messages.message", "messages.date_created")
      .innerJoin("messages", "conversations.id", "messages.conversation_id")
      .where("conversations.id", conversation_id)
      .orderBy("messages.date_created", "desc")
      .first();
  },
};

module.exports = MessageService;
