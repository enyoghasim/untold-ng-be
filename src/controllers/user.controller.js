// import { Request, Response } from 'express';

import { Types } from "mongoose";
import Users from "../models/user.model.js";
import { caseInSensitiveRegex } from "../utils/helpers.js";

class UserController {
  static getUserDetails(selector, selectDetails) {
    return new Promise((resolve, reject) => {
      try {
        const arrOfSelectors = [
          {
            email: caseInSensitiveRegex(selector.toString()),
          },
        ];

        if (Types.ObjectId.isValid(selector?.toString())) {
          arrOfSelectors.push({
            _id: selector,
          });
        }

        Users.findOne({
          $or: arrOfSelectors,
        })
          .select(selectDetails ?? "")
          // .lean()
          .then((details) => {
            resolve(details);
          })
          .catch((error) => {
            reject(error);
          });
      } catch (error) {
        reject(error);
      }
    });
  }
}

export default UserController;
