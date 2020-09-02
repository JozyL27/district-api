const express = require("express");
const MessageService = require("./messages-service");
const MessagesRouter = express.Router();

MessagesRouter.route("/conversations/:user_id").get(async (req, res, next) => {
  const { user_id } = req.params;
  const { page } = req.query;
  try {
    const conversations = await MessageService.getConverstations(
      req.app.get("db"),
      user_id,
      page
    );
    await Promise.all(
      conversations.map(
        async (convo) =>
          (convo.lastMessage = await MessageService.getLastMessageInConversation(
            req.app.get("db"),
            convo.id
          ))
      )
    );

    res.status(200).json(conversations);
  } catch (error) {
    next(error);
  }
});

module.exports = MessagesRouter;
