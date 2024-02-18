import mongoose from "mongoose";
import { config } from "dotenv";

config();

const connectToDb = () => {
  return new Promise(async (resolve, reject) => {
    try {
      const connectDetails = await mongoose.connect(process.env.MONGO_URI);
      return resolve(connectDetails);
    } catch (error) {
      console.log(error);
      reject(error);
    }
  });
};

export default connectToDb;
