const {
  ComputedPosts,
  CurrentUsersPost,
} = require("../Actions/Posts/OtherPosts");

const GetPosts = async ({ currentUser }) => {
  try {
    // Retrieve posts from chats and own posts
    const chatWithPost = await ComputedPosts({ currentUser });
    const myPost = await CurrentUsersPost({ currentUser });
    
    console.log("postes:" , chatWithPost)
    console.log("my post", myPost); 
    // Combine posts from chats and own posts
    const allPost = [...chatWithPost, ...myPost];

    // Sort posts by timestamp in descending order
    const sortedPosts = allPost.sort((a, b) => b.timestamp - a.timestamp);
    
    return sortedPosts;
  } catch (error) {
    // Concatenate custom message with caught error message
    const errorMessage = "Failed to retrieve posts. Error: " + (error.message || error);
    throw new Error(errorMessage); // Throw error if retrieval fails
  }
};

module.exports = { GetPosts };
