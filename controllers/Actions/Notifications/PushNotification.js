const { Expo } = require("expo-server-sdk");
const { getDatabase } = require("firebase-admin/database");

let expo = new Expo();
// Function to send Expo notifications
async function PushNotification({ token, title, body }) {
  let messages = [
    {
      to: token,
      sound: "default",
      title: title,
      body: body,
    },
  ];

  let chunks = expo.chunkPushNotifications(messages);

  for (let chunk of chunks) {
    try {
      let ticketChunk = await expo.sendPushNotificationsAsync(chunk);
      console.log(ticketChunk);
    } catch (error) {
      console.error(error);
    }
  }
}
async function GetPushNotificationToken({ userid }) {
  let token;
  const notificationtokenRef = await getDatabase()
    .ref(`notificationtokens/${userid}`)
    .once("value");
  if (notificationtokenRef.exists()) {
    token = notificationtokenRef.val().data;
  } else {
    token = null;
  }
  return token;
}
async function AddPushNotificationToken({ userid, token }) {
  const notificationtokenRef = getDatabase().ref(
    `notificationtokens/${userid}`
  );
  console.log(token);
  const snapshot = await notificationtokenRef.once("value");
  if (snapshot.exists()) {
    notificationtokenRef.update({ ...token });
  }
  return token;
}
module.exports = {
  PushNotification,
  GetPushNotificationToken,
  AddPushNotificationToken,
};
