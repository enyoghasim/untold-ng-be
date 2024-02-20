import { randomBytes } from "crypto";

export const caseInSensitiveRegex = (val) => {
  return new RegExp(`^${val}$`, "i");
};

export const generateRandomHexadecimalToken = () => {
  return randomBytes(16).toString("hex");
};
