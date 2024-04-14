const { ComputedPosts, CurrentUsersPost } = require("../Actions/Posts/OtherPosts");

const GetPosts = async ({ currentUser }) => {
  try {
    // Retrieve posts from chats and own posts
    const chatWithPost = await ComputedPosts({ currentUser });
    const myPost = await CurrentUsersPost({ currentUser });

    // Combine posts from chats and own posts
    let allPost = [];
    if (chatWithPost) allPost = allPost.concat(chatWithPost);
    if (myPost) allPost = allPost.concat(myPost);

    // Check if allPost is empty or null
    if (!allPost || allPost.length === 0) {
      throw new Error("No posts found."); // Throw an error if no posts found
    }

    // Sort posts by timestamp in descending order
    const sortedPosts = allPost.sort((a, b) => b.timestamp - a.timestamp);

    return sortedPosts;
  } catch (error) {
    // Log the error for debugging
    console.error("Error in GetPosts:", error);

    // Rethrow the error
    throw new Error("Failed to retrieve posts. Error: " + (error.message || error));
  }
};

module.exports = { GetPosts };
