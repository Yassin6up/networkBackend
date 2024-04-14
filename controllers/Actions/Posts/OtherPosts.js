const { getDatabase } = require("firebase-admin/database");
const { DMKeys } = require("../../Chats/ChatList");
const { GetUserData } = require("../../Profile/GetUserData");
const { HasUserLikedPost } = require("../../Posts/Reaction");
const { HasUserLikedProfile } = require("../Profile/ProfileActions");

const CurrentUsersPost = async ({ currentUser }) => {
  try {
    const postRef = getDatabase().ref("posts");
    const snapshot = await postRef
      .orderByChild("author")
      .equalTo(currentUser)
      .once("value");

    const posts = [];

    if (snapshot.exists()) {
      for (const key in snapshot.val()) {
        const { userData } = await GetUserData({
          user: snapshot.val()[key].author,
        });
        const liked = await HasUserLikedPost({
          currentUser: snapshot.val()[key].author,
          postid: key,
        });
        posts.push({
          userData,
          ...snapshot.val()[key],
          postid: key,
          type: "You",
          liked,
        });
      }
      return posts;
    } else {
      return []; // Return an empty array if no posts are found
    }
  } catch (error) {
    throw new Error(error.message); // Throw a new Error object with the error message
  }
};
const GetSinglePost = async ({ postid }) => {
  try {
    const postRef = getDatabase().ref("posts/" + postid);
    const snapshot = await postRef.once("value");

    let posts;

    if (snapshot.exists()) {
      posts = {
        ...snapshot.val(),
        postid: snapshot.key,
      };
      return posts;
    } else {
      return []; // Return an empty array if no posts are found
    }
  } catch (error) {
    throw new Error(error.message); // Throw a new Error object with the error message
  }
};

const ComputedPosts = async ({ currentUser }) => {
  try {
    const chattedWithArray = await DMKeys({
      name: "dms",
      value: currentUser,
      child: "chats",
    });

    const postRef = getDatabase().ref("posts");
    const snapshot = await postRef.once("value");
    const posts = [];

    // Fetching posts from chats
    await Promise.all(
      chattedWithArray.map(async (key) => {
        const chatSnapshot = await postRef
          .orderByChild("author")
          .equalTo(key)
          .once("value");

        for (const postKey in chatSnapshot.val()) {
          const post = chatSnapshot.val()[postKey];
          if (post.author !== currentUser) {
            const { userData } = await GetUserData({ user: post.author });
            const liked = await HasUserLikedPost({
              currentUser: post.author,
              postid: postKey,
            });
            posts.push({
              userData,
              ...post,
              type: "From your chats",
              postid: postKey,
              liked,
            });
          }
        }
      })
    );

    // Fetching posts from liked profiles
    for (const postKey in snapshot.val()) {
      const post = snapshot.val()[postKey];
      const likedProfile = await HasUserLikedProfile({
        user: currentUser,
        matchid: post.author,
      });
      if (likedProfile) {
        if (
          !chattedWithArray.includes(post.author) &&
          currentUser !== post.author
        ) {
          const { userData } = await GetUserData({ user: post.author });
          const liked = await HasUserLikedPost({
            currentUser: post.author,
            postid: postKey,
          });

          posts.push({
            userData,
            ...post,
            type: "From Profiles you've liked",
            postid: postKey,
            liked,
          });
        }
      }
    }

    return posts;
  } catch (error) {
    throw new Error(error.message);
  }
};

const GetPostLikeCount = async ({ postid }) => {
  let likeCount = 0;
  const likesRef = await getDatabase().ref(`likes/${postid}`).once("value");
  if (likesRef.exists()) {
    likesRef.forEach((snapshot) => {
      if (snapshot.val().liked === true) {
        likeCount++;
      }
    });
  }
  return likeCount;
};

module.exports = {
  ComputedPosts,
  CurrentUsersPost,
  GetPostLikeCount,
  GetSinglePost,
};
