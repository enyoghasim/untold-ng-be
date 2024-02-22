import { config } from "dotenv";
import express from "express";
import cors from "cors";
import session from "express-session";
import sessionStore from "./config/sessionStore.js";
import ApiRoute from "./routes/index.js";
import connectToDb from "./config/mongoose.js";
import helmet from "helmet";

const app = express();
config();

const server = async () => {
  app.use(
    cors({
      origin: [
        "http://localhost:8000",
        "http://192.168.1.22:8000",
        "http://untold.ng",
        "https://untold.ng",
        "https://www.untold.ng",
        "http://www.untold.ng",
      ],
      credentials: true,
    })
  );
  app.use(helmet());
  app.use(express.json());
  app.disable("x-powered-by");
  app.use(express.urlencoded({ extended: true }));
  app.set("trust proxy", 1);

  app.use(
    session({
      secret: process.env.SESSION_SECRET,
      resave: true,
      saveUninitialized: true,
      store: sessionStore,
      proxy: true,
      cookie: {
        httpOnly: process.env.NODE_ENV === "production",
        secure: process.env.NODE_ENV === "production",
        sameSite: true,
        maxAge: 7 * 24 * 60 * 60 * 1000,
      },
    })
  );

  app.use("/api", ApiRoute);

  connectToDb()
    .then(() => {
      console.log("Connected to DB");
    })
    .then(() => {
      const PORT = process.env.PORT || 3000;
      app.listen(PORT, (e) => {
        console.log(`Server is running on port http://localhost:${PORT}`);
      });
    });
};

export default server;
