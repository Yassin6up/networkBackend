const { getDatabase } = require("firebase-admin/database");

const AddToNofication = async ({ userid, data }) => {
  try {
    const notificationRef = getDatabase().ref(`notifications/${userid}`).push();
    await notificationRef.set(data);
    return "done";
  } catch (error) {
    throw new Error(error);
  }
};
const GetNotifications = async ({ userid }) => {
  try {
    let notifications = [];
    const notificationRef = getDatabase().ref(`notifications/${userid}`);
    const snapshot = await notificationRef.once("value");
    snapshot.forEach((snap) => {
      const data = { ...snap.val, id: snap.key };
      notificationRef.push(data);
    });
    return notifications;
  } catch (error) {
    throw new Error(error);
  }
};
const SeenNotification = async ({ userid, notificationid }) => {
  try {
    let notifications = [];
    const notificationRef = getDatabase().ref(
      `notifications/${userid}/${notificationid}`
    );
    const snapshot = await notificationRef.once("value");
    if (snapshot.exists()) {
      await notificationRef.update({ readNotification: true });
    }
    return "done";
  } catch (error) {
    throw new Error(error);
  }
};

module.exports = { AddToNofication, GetNotifications, SeenNotification };
