const {
  ComputedPosts,
  CurrentUsersPost,
} = require("../Actions/Posts/OtherPosts");

const GetPosts = async ({ currentUser }) => {
  try {
    // Retrieve posts from chats and own posts
    const chatWithPost = await ComputedPosts({ currentUser });
    const myPost = await CurrentUsersPost({ currentUser });

    // Combine posts from chats and own posts
    const allPost = [...chatWithPost, ...myPost];

    // Sort posts by timestamp in descending order
    const sortedPosts = allPost.sort((a, b) => b.timestamp - a.timestamp);

    return sortedPosts;
  } catch (error) {
    throw new Error("Failed to retrieve posts." , error ); // Throw error if retrieval fails
  }
};

module.exports = { GetPosts };
