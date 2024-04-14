const { getDatabase } = require("firebase-admin/database");
const { GetStorageKeys } = require("./utils/DMKeys");

const GetUnreadMessageCount = async ({ user, friend }) => {
  try {
    const userkey = await GetStorageKeys({
      name: "dms",
      child: "members",
      value: [user, friend],
    });

    const db = getDatabase();
    let unread = 0;

    if (userkey) {
      const membersRef = db.ref(`dms/${userkey}/chats`);

      // Wait for the snapshot to resolve
      const snapshot = await membersRef.once("value");

      if (snapshot.exists()) {
        snapshot.forEach((snap) => {
          if (snap.val().author !== user && snap.val().read === false) {
            unread++;
          }
        });
      }

      return unread;
    } else {
      return 0;
    }
  } catch (error) {
    throw new Error(error);
  }
};

module.exports = {
  GetUnreadMessageCount,
};
