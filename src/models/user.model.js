import { Schema, model } from "mongoose";

const userSchema = new Schema(
  {
    email: {
      type: String,
      required: true,
      unique: true,
    },
    password: String,
    tokens: {
      type: Number,
      default: 0,
    },
    activeSession: {
      type: String,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

export default model("Users", userSchema);
