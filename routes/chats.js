const express = require("express");
const { checkTokenMiddleware } = require("../utils/tokenmiddleware");
const {
  checkParametersMiddleware,
} = require("../utils/checkParametersMiddleware");
const { InitializeDM } = require("../controllers/Chats/InitializeDM");
const { SendDM } = require("../controllers/Chats/SendMessage");
const { SeenMessage } = require("../controllers/Chats/SeenMessage");
const { ChatList, TotalUnreadCount } = require("../controllers/Chats/ChatList");
const {
  GetTotalUnreadMessages,
} = require("../controllers/Chats/utils/TotalUnreadMessages");
const chatsRouter = express.Router();

chatsRouter.post(
  "/initializedm",
  checkTokenMiddleware,
  checkParametersMiddleware(["matchid"]),
  async (req, res, next) => {
    try {
      const { matchid } = req.body;
      const result = await InitializeDM({ user: req.uid, matchid: matchid });
      res.status(200).json({ result: result });
    } catch (error) {
      next(error);
    }
  }
);
chatsRouter.post(
  "/senddm",
  checkTokenMiddleware,
  checkParametersMiddleware(["matchid", "message"]),
  async (req, res, next) => {
    try {
      const {
        matchid,
        message,
        refid = null,
        imageurl = null,
        type = "text",
        audioUrl = null,
        duration = null,
        hidden = null,
      } = req.body;
      await SendDM({
        user: req.uid,
        matchid: matchid,
        message: message,
        refid: refid,
        imageurl: imageurl,
        type: type,
        audioUrl: audioUrl,
        duration: duration,
        hidden,
      });
      res.status(200).json({ result: "chat sent" });
    } catch (error) {
      next(error);
    }
  }
);
chatsRouter.post(
  "/seendm",
  checkTokenMiddleware,
  checkParametersMiddleware(["matchid", "chatid"]),
  async (req, res, next) => {
    try {
      const { matchid, chatid } = req.body;
      await SeenMessage({
        user: req.uid,
        matchid: matchid,
        chatid: chatid,
      });
      res.status(200).json({ result: true });
    } catch (error) {
      next(error);
    }
  }
);
chatsRouter.get("/chatlist", checkTokenMiddleware, async (req, res, next) => {
  try {
    const result = await ChatList({ user: req.uid });
    const unread = await TotalUnreadCount({ result });
    res.status(200).json({ result, unread });
  } catch (error) {
    next(error);
  }
});
chatsRouter.get(
  "/numofunread",
  checkTokenMiddleware,
  async (req, res, next) => {
    try {
      const result = await GetTotalUnreadMessages({ user: req.uid });
      res.status(200).json({ result });
    } catch (error) {
      next(error);
    }
  }
);
chatsRouter.use((err, req, res, next) => {
  console.error(err); // Log the error for debugging purposes
  res.status(500).json({ error: "Something went wrong" });
});
module.exports = { chatsRouter };
