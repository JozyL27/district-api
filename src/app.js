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
const FollowersRouter = require("./followers/followers-router");
const formData = require("express-form-data");
const session = require("express-session");
const app = express();

const morganOption = NODE_ENV === "production" ? "tiny" : "common";

const sessionConfig = {
  secret: "graduation",
  resave: false,
  saveUninitialized: false,
  cookie: {
    sameSite: "None",
  },
};

const corsOptions = {
  origin:
    NODE_ENV === "production"
      ? "https://district-client.vercel.app"
      : "http://localhost:3000",
  credentials: true,
};

if (NODE_ENV === "production") {
  app.set("trust proxy", 1);
  sessionConfig.cookie.secure = true;
}

app.use(session(sessionConfig));
app.use(morgan(morganOption));
app.use(helmet());
app.use(cors(corsOptions));
app.use(formData.parse());

app.use("/api/user", UserRouter);
app.use("/api/auth", AuthRouter);
app.use("/api/articles", ArticlesRouter);
app.use("/api/upvotes", UpvoteRouter);
app.use("/api/comments", CommentsRouter);
app.use("/api/followers", FollowersRouter);
app.get("/", (req, res) => {
  res.send("Hello, World!");
});

app.use(errorHandler);

module.exports = app;
