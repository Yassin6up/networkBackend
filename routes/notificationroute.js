const express = require("express");
const { checkTokenMiddleware } = require("../utils/tokenmiddleware");
const {
  checkParametersMiddleware,
} = require("../utils/checkParametersMiddleware");

const {
  SeeStory,
  StorySeenCount,
} = require("../controllers/Stories/StoriesReactions");
const { GetStories } = require("../controllers/Stories/GetStories");
const {
  AddPushNotificationToken,
} = require("../controllers/Actions/Notifications/PushNotification");

const notificationrouter = express.Router();

notificationrouter.post(
  "/addtoken",
  checkTokenMiddleware,
  checkParametersMiddleware(["token"]),
  async (req, res, next) => {
    try {
      const { token } = req.body;
      console.log(token);
      const result = await AddPushNotificationToken({
        userid: req.uid,
        token,
      });
      res.status(200).json(result); // Sending a success response
    } catch (error) {
      next(error); // Passing the error to the error handling middleware
    }
  }
);

notificationrouter.get(
  "/getstories",
  checkTokenMiddleware,
  async (req, res, next) => {
    try {
      const result = await GetStories({
        currentUser: req.uid,
      });
      res.status(200).json(result); // Sending a success response
    } catch (error) {
      next(error); // Passing the error to the error handling middleware
    }
  }
);

notificationrouter.use((err, req, res, next) => {
  console.error(err); // Log the error for debugging purposes
  res.status(500).json({ error: "Something went wrong" });
});

module.exports = { notificationrouter };
