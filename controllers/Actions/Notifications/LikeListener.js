const { getDatabase } = require("firebase-admin/database");
const {
  GetPushNotificationToken,
  PushNotification,
} = require("./PushNotification");
const { GetUserData } = require("../../Profile/GetUserData");
const { GetSinglePost } = require("../Posts/OtherPosts");
const { AddToNofication } = require("./AddToNotifications");

const handleUpdate = async ({ likedBy, postid, liked, timestamp }) => {
  const postinfo = await GetSinglePost({ postid });
  if (liked == true) {
    if (likedBy !== postinfo.author) {
      const notificationData = {
        ...postinfo,
        readNotification: false,
        timestamp,
        type: "posts",
        subType: "like",
      };
      await AddToNofication({
        userid: postinfo.author,
        data: notificationData,
      });
      const token = await GetPushNotificationToken({ userid: postinfo.author });
      if (token !== null) {
        const { userData } = await GetUserData({ user: likedBy });
        await PushNotification({
          token,
          title: userData.fullName,
          body: "Liked your post",
        });
      }
    }
  }
};
const LikeListener = async () => {
  const chatRef = getDatabase().ref("likes");
  let holddata;
  let key;
  chatRef.on("child_changed", (snapshot) => {
    key = snapshot.key;
    snapshot.forEach((snap) => {
      holddata = snap.val();
    });
    handleUpdate({
      likedBy: holddata.likedBy,
      postid: key,
      liked: holddata.liked,
      timestamp: holddata.timestamp,
    });
  });
};
module.exports = { LikeListener };
