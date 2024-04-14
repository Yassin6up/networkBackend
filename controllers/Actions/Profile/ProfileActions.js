const { getDatabase } = require("firebase-admin/database");
const LikeProfile = async ({ user, matchid }) => {
  try {
    const hasUserLikedProfile = await HasUserLikedProfile({ user, matchid });

    if (!hasUserLikedProfile) {
      const profileLikeRef = getDatabase()
        .ref(`profile/${matchid}/likes`)
        .push();
      profileLikeRef
        .set({
          likedBy: user,
        })
        .then(async (result) => {
          return "added";
        })
        .catch((error) => {
          throw new Error(error);
        });
    } else {
      const profileLikeRef = getDatabase().ref(`profile/${matchid}/likes`);
      const snapshot = await profileLikeRef
        .orderByChild("likedBy")
        .equalTo(user)
        .once("value");
      if (snapshot.exists()) {
        const key = Object.keys(snapshot.val())[0];
        await getDatabase().ref(`profile/${matchid}/likes/${key}`).remove();
      }
    }

    return;
  } catch (error) {
    throw new Error(error);
  }
};
const HasUserLikedProfile = async ({ user, matchid }) => {
  try {
    const profileLikeRef = getDatabase().ref(`profile/${matchid}/likes`);
    const snapshot = await profileLikeRef
      .orderByChild("likedBy")
      .equalTo(user)
      .once("value");
    return snapshot.exists(); // Corrected typo: exists() instead of exist()
  } catch (error) {
    throw new Error(error);
  }
};
const ProfileLikeCount = async ({ matchid }) => {
  try {
    const profileLikeRef = getDatabase()
      .ref(`profile/${matchid}/likes`)
      .once("value");
    const likeCount = (await profileLikeRef).numChildren();
    return likeCount; // Corrected typo: exists() instead of exist()
  } catch (error) {
    throw new Error(error);
  }
};
const BlockUser = async ({ user, matchid }) => {
  try {
    await getDatabase()
      .ref(`blocked/${user}/${matchid}`)
      .set({ blocked: matchid });
    return "blocked";
  } catch (error) {
    throw new Error(error);
  }
};
const IsUserBlockedByMe = async ({ user, matchid }) => {
  try {
    const blockedRef = await getDatabase()
      .ref(`blocked/${user}/${matchid}`)
      .once("value");
    return blockedRef.exists();
  } catch (error) {
    console.error("Error checking if user is blocked:", error);
    throw error;
  }
};
const Unblock = async ({ user, matchid }) => {
  try {
    const blockedRef = getDatabase().ref(`blocked/${user}`);
    const snapshot = await blockedRef.child(matchid).once("value"); // Get the snapshot for the specific matchid
    if (snapshot.exists()) {
      // Check if the matchid exists
      await blockedRef.child(matchid).remove(); // Remove the matchid
      return "unblocked";
    } else {
      return "MatchID not found"; // Return a message if matchid doesn't exist
    }
  } catch (error) {
    console.error("Error unblocking user:", error);
    throw error;
  }
};

const AmIBlocked = async ({ user, matchid }) => {
  try {
    const blockedRef = await getDatabase()
      .ref(`blocked/${matchid}/${user}`)
      .once("value");
    return blockedRef.exists();
  } catch (error) {
    console.error("Error checking if user is blocked:", error);
    throw error;
  }
};
const BlockAction = async ({ user, matchid }) => {
  const blocked = await IsUserBlockedByMe({ user, matchid });

  let result;
  if (!blocked) {
    result = await BlockUser({ user, matchid });
  } else {
    result = await Unblock({ user, matchid });
  }
  return result;
};
module.exports = {
  LikeProfile,
  HasUserLikedProfile,
  BlockUser,
  IsUserBlockedByMe,
  Unblock,
  AmIBlocked,
  BlockAction,
  ProfileLikeCount,
};
