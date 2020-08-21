require("dotenv").config();
const express = require("express");
const morgan = require("morgan");
const cors = require("cors");
const helmet = require("helmet");
const { NODE_ENV } = require("./config");
const errorHandler = require("./middleware/error-handler");
const UserRouter = require("./user/user-router");
const AuthRouter = require("./auth/auth-router");
const ArticlesRouter = require("./articles/article-router");
const UpvoteRouter = require("./Upvotes/upvote-router");
const CommentsRouter = require("./comments/comments-router");
const formData = require("express-form-data");

const app = express();

const morganOption = NODE_ENV === "production" ? "tiny" : "common";

app.use(morgan(morganOption));
app.use(helmet());
app.use(cors());
app.use(formData.parse());

app.use("/api/user", UserRouter);
app.use("/api/auth", AuthRouter);
app.use("/api/articles", ArticlesRouter);
app.use("/api/upvotes", UpvoteRouter);
app.use("/api/comments", CommentsRouter);
app.get("/", (req, res) => {
  res.send("Hello, World!");
});

app.use(errorHandler);

module.exports = app;
