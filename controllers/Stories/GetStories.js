const {
  StoriesOfPeopleChattedWith,
  CurrentUsersStory,
} = require("../Actions/Posts/StoriesActions");
function groupByAuthor(stories) {
  // Grouping stories by author
  const groupedStories = stories.reduce((groupedStory, story) => {
    const author = story.author;
    if (!groupedStory[author]) {
      groupedStory[author] = [];
    }
    groupedStory[author].push(story);
    return groupedStory;
  }, {});

  // Sorting stories within each author's group by timestamp
  for (const author in groupedStories) {
    groupedStories[author].sort((a, b) => b.timestamp - a.timestamp); // Assuming timestamp is a numerical value
  }

  return groupedStories;
}

const GetStories = async ({ currentUser }) => {
  try {
    // Retrieve posts from chats and own posts
    const otherStories = await StoriesOfPeopleChattedWith({ currentUser });
    const myStories = await CurrentUsersStory({ currentUser });

    // Combine posts from chats and own posts
    const allPosts = [...otherStories, ...myStories];

    // Sort posts by timestamp in descending order
    const sortedPosts = allPosts.sort((a, b) => b.timestamp - a.timestamp);

    // Sort by 'seen' flag and prioritize unseen stories by the current user
    sortedPosts.sort((a, b) => {
      // Prioritize unseen stories authored by the current user
      if (a.seen !== b.seen) {
        return a.seen ? 1 : -1; // Unseen posts first
      }
      // If both seen or both unseen, prioritize the current user's stories
      if (a.author === currentUser && !a.seen) return -1;
      if (b.author === currentUser && !b.seen) return 1;
      // Preserve the original order for other cases
      return 0;
    });

    return groupByAuthor(sortedPosts);
  } catch (error) {
    throw new Error("Failed to retrieve posts."); // Throw error if retrieval fails
  }
};

module.exports = { GetStories };
