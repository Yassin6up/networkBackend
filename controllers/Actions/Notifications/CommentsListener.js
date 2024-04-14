const { getDatabase } = require("firebase-admin/database");
const {
  GetPushNotificationToken,
  PushNotification,
} = require("./PushNotification");
const { GetUserData } = require("../../Profile/GetUserData");
const { GetSinglePost } = require("../Posts/OtherPosts");
const { AddToNofication } = require("./AddToNotifications");

const handleUpdate = async ({ author, postid, timestamp }) => {
  const postinfo = await GetSinglePost({ postid });
  if (author !== postinfo.author) {
    const notificationData = {
      ...postinfo,
      readNotification: false,
      timestamp,
      type: "posts",
      subType: "comments",
    };
    await AddToNofication({
      userid: postinfo.author,
      data: notificationData,
    });
    const token = await GetPushNotificationToken({ userid: postinfo.author });
    if (token !== null) {
      const { userData } = await GetUserData({ user: author });
      await PushNotification({
        token,
        title: userData.fullName,
        body: "commented on your post",
      });
    }
  }
};
const CommentsListener = async () => {
  const commentsRef = getDatabase().ref("comments");
  let holddata;
  let key;
  commentsRef.on("child_changed", (snapshot) => {
    key = snapshot.key;
    snapshot.forEach((snap) => {
      holddata = snap.val();
    });
    handleUpdate({
      author: holddata.author,
      postid: key,
      timestamp: holddata.timestamp,
    });
  });
};
module.exports = { CommentsListener };
