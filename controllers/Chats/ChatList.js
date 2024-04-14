const { getDatabase } = require("firebase-admin/database");
const { GetUserData } = require("../Profile/GetUserData");
const { GetLastMessage } = require("./GetLastMessage");
const { GetUnreadMessageCount } = require("./GetUnreadMessages");
const {
  IsUserBlockedByMe,
  AmIBlocked,
} = require("../Actions/Profile/ProfileActions");

const DMKeys = async ({ name, child, value }) => {
  try {
    const ref = getDatabase().ref(name);
    const snapshot = await ref.orderByChild(child).once("value");

    if (snapshot.exists()) {
      let foundKeys = [];
      snapshot.forEach((childSnapshot) => {
        const childValue = childSnapshot.val();
        if (
          childValue &&
          childValue.members &&
          childValue.members.hasOwnProperty(value)
        ) {
          const members = childValue.members;
          delete members[value];
          const keys = Object.keys(members);
          foundKeys.push(keys.length > 0 && keys[0]);
        }
      });
      return foundKeys;
    } else {
      return null;
    }
  } catch (error) {
    throw new Error(error.message);
  }
};

const ChatList = async ({ user }) => {
  try {
    const userKeys = await DMKeys({ name: "dms", value: user, child: "chats" });

    const userDataPromises = userKeys.map(async (key) => {
      const blocked = await IsUserBlockedByMe({ user, matchid: key });
      const iAmBlocked = await AmIBlocked({ user, matchid: key });

      if (blocked == false && iAmBlocked == false) {
        const lastMessage = await GetLastMessage({ user, friend: key });
        if (Object.keys(lastMessage).length > 0) {
          const unread = await GetUnreadMessageCount({ user, friend: key });
          const userData = await GetUserData({ user: key });
          return { lastMessage, userData, unread, blocked };
        }
      }
    });

    const userDataWithLastMessages = await Promise.all(userDataPromises);

    const dmObjects = userDataWithLastMessages
      .filter(Boolean)
      .map(({ lastMessage, userData, unread, blocked }) => ({
        lastMessage,
        ...userData,
        unread,
        blocked,
      }));

    dmObjects.sort((a, b) => {
      const dateA = new Date(a.lastMessage.sent);
      const dateB = new Date(b.lastMessage.sent);
      return dateB - dateA; // Sort in descending order (latest first)
    });

    return dmObjects;
  } catch (error) {
    throw new Error(error);
  }
};

const TotalUnreadCount = ({ result }) => {
  const unread = result.reduce((total, chat) => total + chat.unread, 0);
  return unread;
};

module.exports = { ChatList, DMKeys, TotalUnreadCount };
