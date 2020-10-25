require("dotenv").config();
import app from "./app";
const fs = require("fs");
const { ApolloServer } = require("apollo-server-express");
const knex = require("knex");
const server = require("http").createServer(app);
const io = require("socket.io").listen(server, {
  handlePreflightRequest: (req: any, res: any) => {
    const headers = {
      "Access-Control-Allow-Headers": "Content-Type, Authorization",
      "Access-Control-Allow-Origin": req.headers.origin,
      "Access-Control-Allow-Credentials": true,
    };
    res.writeHead(200, headers);
    res.end();
  },
});
const SocketManager = require("./messages/socket-manager");
const { PORT, DATABASE_URL } = require("./config");
const db = knex({
  client: "pg",
  connection: DATABASE_URL,
});
app.set("db", db);

const typeDefs = fs.readFileSync("./src/schema/schema.graphql", {
  encoding: "utf-8",
});
const resolvers = require("./resolvers/resolvers");

const apolloServer = new ApolloServer({
  typeDefs,
  resolvers,
  context: ({ req, res }: any) => ({ req, res }),
});

apolloServer.applyMiddleware({ app, path: "/graphql" });
io.on("connection", SocketManager);
server.listen(PORT, () => {
  console.log(`Server listening at http://localhost:${PORT}/graphql`);
});
