export const caseInSensitiveRegex = (val) => {
  return new RegExp(`^${val}$`, "i");
};
