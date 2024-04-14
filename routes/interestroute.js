const express = require("express");
const { checkTokenMiddleware } = require("../utils/tokenmiddleware");
const {
  checkParametersMiddleware,
} = require("../utils/checkParametersMiddleware");

const { CreateStory } = require("../controllers/Stories/CreateAStory");
const {
  SeeStory,
  StorySeenCount,
} = require("../controllers/Stories/StoriesReactions");
const { GetStories } = require("../controllers/Stories/GetStories");
const {
  GetStoryLists,
} = require("../controllers/Actions/Posts/StoriesActions");
const {
  NumberOfUsersWithInterest,
  UsersWithInterest,
} = require("../controllers/Actions/Interest/Actions");

const interestrouter = express.Router();

interestrouter.post(
  "/seestory",
  checkTokenMiddleware,
  checkParametersMiddleware(["storyid"]),
  async (req, res, next) => {
    try {
      const { storyid, location } = req.body;
      const result = await SeeStory({
        currentUser: req.uid,
        storyid,
        location,
      });
      res.status(200).json(result); // Sending a success response
    } catch (error) {
      next(error); // Passing the error to the error handling middleware
    }
  }
);

interestrouter.get(
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
interestrouter.get(
  "/interestuserscount",
  checkTokenMiddleware,
  checkParametersMiddleware(["interest"]),
  async (req, res, next) => {
    try {
      const { interest } = req.query;
      const result = await NumberOfUsersWithInterest({ interest });
      res.status(200).json({ result });
    } catch (error) {
      next(error);
    }
  }
);
interestrouter.get(
  "/interestusers",
  checkTokenMiddleware,
  checkParametersMiddleware(["interest"]),
  async (req, res, next) => {
    try {
      const { interest } = req.query;
      const result = await UsersWithInterest({
        currentUser: req.uid,
        interest,
      });
      res.status(200).json({ result });
    } catch (error) {
      next(error);
    }
  }
);

interestrouter.use((err, req, res, next) => {
  console.error(err); // Log the error for debugging purposes
  res.status(500).json({ error: "Something went wrong" });
});

module.exports = { interestrouter };
