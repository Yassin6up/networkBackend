const { getAuth } = require("firebase-admin/auth");
const { GetUserData } = require("./GetUserData");

const GetDaysDifference = ({ date }) => {
  // Old date
  var oldDate = new Date(date);

  // Current date
  var currentDate = new Date();

  // Calculate the difference in milliseconds
  var timeDifference = currentDate.getTime() - oldDate.getTime();

  // Convert milliseconds to days
  var daysDifference = Math.floor(timeDifference / (1000 * 60 * 60 * 24));

  // Display the result
  return daysDifference;
};

const RecentlyJoinedUsers = async (nextPageToken) => {
  let users = [];

  try {
    const listUsersResult = await getAuth().listUsers(1000, nextPageToken);

    for (const userRecord of listUsersResult.users) {
      if (GetDaysDifference({ date: userRecord.metadata.creationTime }) < 20) {
        const userData = await GetUserData({ user: userRecord.uid });
        if (userData !== null) {
          users.push({
            ...userData.userData,
            userKey: userData.userKey,
            daysDifference: GetDaysDifference({
              date: userRecord.metadata.creationTime,
            }),
          });
        } else {
        }
      }
    }

    if (listUsersResult.pageToken) {
      // Recursively fetch next batch of users
      const nextPageUsers = await RecentlyJoinedUsers(
        listUsersResult.pageToken
      );
      users = users.concat(nextPageUsers);
    }

    return users;
  } catch (error) {
    throw error;
  }
};

module.exports = { RecentlyJoinedUsers };
