import MongoStore from "connect-mongo";
import { config } from "dotenv";

config();

const sessionStore = MongoStore.create({
  mongoUrl: process.env.MONGO_URI,
  collectionName: "sessions",
});

export default sessionStore;
