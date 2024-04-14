const { getDatabase } = require("firebase-admin/database");
const {
  GetPushNotificationToken,
  PushNotification,
} = require("./PushNotification");
const { GetUserData } = require("../../Profile/GetUserData");

const handleUpdate = async ({ chats, members }) => {
  const chatKeys = Object.keys(chats);
  const lastChatKey = chatKeys[chatKeys.length - 1];

  const newData = chats[lastChatKey];
  delete members[newData.author];
  //filter out the member who is the author
  if (newData.read === false) {
    const userid = Object.values(members)[0];
    const token = await GetPushNotificationToken({ userid });
    if (token !== null) {
      const { userData } = await GetUserData({ user: newData.author });
      await PushNotification({
        token,
        title: userData.fullName,
        body: newData.message,
      });
    }
  }
};
const ChatListenser = async () => {
  const chatRef = getDatabase().ref("dms");
  let holddata;
  chatRef.on("child_changed", (snapshot) => {
    const changedChats = snapshot.val();
    console.log(JSON.stringify(snapshot.val(), null, 2));
    handleUpdate({
      chats: changedChats.chats,
      members: changedChats.members,
    });
  });
};
module.exports = { ChatListenser };
