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
const MessagesRouter = require("./messages/messages-router");
const formData = require("express-form-data");
const session = require("express-session");
const compression = require("compression");

const app = express();

interface Session {
  secret: string;
  resave: boolean;
  saveUninitialized: boolean;
  cookie: {
    sameSite: string;
    secure: boolean;
  };
}

const morganOption = NODE_ENV === "production" ? "tiny" : "common";

const sessionConfig: Session = {
  secret: "graduation",
  resave: false,
  saveUninitialized: false,
  cookie: {
    sameSite: "None",
    secure: false,
  },
};

const corsOptions = {
  origin:
    NODE_ENV === "production"
      ? "https://district-client.vercel.app"
      : "http://localhost:3000",
  credentials: true,
};

const compressionOptions = {
  level: 6,
  threshold: 10 * 1000,
  filter: (req: any, res: any) => {
    if (req.headers["x-no-compression"]) {
      return false;
    }
    return compression.filter(req, res);
  },
};

if (NODE_ENV === "production") {
  app.set("trust proxy", 1);
  sessionConfig.cookie.secure = true;
}

app.use(session(sessionConfig));
app.use(morgan(morganOption));
app.use(helmet());
app.use(cors(corsOptions));
app.use(compression(compressionOptions));
app.use(formData.parse());

app.use("/api/user", UserRouter);
app.use("/api/auth", AuthRouter);
app.use("/api/articles", ArticlesRouter);
app.use("/api/upvotes", UpvoteRouter);
app.use("/api/comments", CommentsRouter);
app.use("/api/followers", FollowersRouter);
app.use("/api/messages", MessagesRouter);
app.get("/", (req: any, res: any) => {
  res.send("Hello, World!");
});

app.use(errorHandler);

export default app;
