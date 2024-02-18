import { Document, model, Schema } from "mongoose";

const ResetPasswordTokenSchema = new Schema(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: "Users",
      required: true,
    },
    selector: {
      type: String,
      required: true,
    },
    token: {
      type: String,
      required: true,
    },
    expiresAt: {
      type: Date,
      required: true,
    },
    createdAt: {
      type: Date,
      default: Date.now,
      index: { expires: "15m" },
    },
  },
  {
    timestamps: true,
  }
);

export default model("ResetPasswordTokens", ResetPasswordTokenSchema);
