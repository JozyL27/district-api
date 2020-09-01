const express = require("express");
const MessageService = require("./messages-service");
const MessagesRouter = express.Router();

MessagesRouter.route("/conversations/:user_id").get(async (req, res, next) => {
  const { user_id } = req.params;
  try {
    const conversations = await MessageService.getConverstations(
      req.app.get("db"),
      user_id
    );

    res.status(200).json(conversations);
  } catch (error) {
    next(error);
  }
});

module.exports = MessagesRouter;
