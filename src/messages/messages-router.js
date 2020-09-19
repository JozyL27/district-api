const express = require("express");
const MessageService = require("./messages-service");
const MessagesRouter = express.Router();
const ArticlesService = require("../articles/articles-service");
const { requireAuth } = require("../middleware/jwt-auth");

MessagesRouter.route("/conversations/:user_id").get(
  requireAuth,
  async (req, res, next) => {
    const { user_id } = req.params;
    const { page } = req.query;

    try {
      const conversations = await MessageService.getConverstations(
        req.app.get("db"),
        user_id,
        page
      );

      if (conversations.length < 1) {
        console.log(conversations);
        return res.status(400).json({
          error: "You have no messages.",
        });
      }

      // adding last message to conversation object
      await Promise.all(
        conversations.map(
          async (convo) =>
            (convo.lastMessage = await MessageService.getLastMessageInConversation(
              req.app.get("db"),
              convo.id
            ))
        )
      );

      // adding partner info to each conversation object.
      await Promise.all(
        conversations.map(
          async (convo) =>
            (convo.partnerInfo = await ArticlesService.getAuthorInfo(
              req.app.get("db"),
              Number(convo.user1id) === Number(user_id)
                ? convo.user2id
                : convo.user1id
            ))
        )
      );

      res.status(200).json(conversations);
    } catch (error) {
      next(error);
    }
  }
);

module.exports = MessagesRouter;
