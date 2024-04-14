const { getDatabase } = require("firebase-admin/database");
const { GetUserArrays } = require("../../Match/GetArrays");
const { percentageMatch } = require("../../Match/CreateMatches");

const NumberOfUsersWithInterest = async ({ interest }) => {
  try {
    let interestCount = 0;
    const profileLikeRef = getDatabase().ref(`users/`);
    const snapshot = await profileLikeRef.once("value");
    if (snapshot.exists()) {
      snapshot.forEach((snap) => {
        snap.val().interest &&
          snap.val().interest.map((inst) => {
            if (inst.toLowerCase() === interest.toLowerCase()) {
              interestCount++;
            }
          });
      });
    }

    return interestCount; // Corrected typo: exists() instead of exist()
  } catch (error) {
    throw new Error(error);
  }
};
const UsersWithInterest = async ({ currentUser, interest }) => {
  try {
    const currentUserArray = await GetUserArrays({ currentUser });
    const interests = [];

    const profileLikeRef = getDatabase().ref(`users/`);
    const snapshot = await profileLikeRef.once("value");

    if (snapshot.exists()) {
      const promises = [];

      snapshot.forEach((snap) => {
        const promise = new Promise(async (resolve) => {
          if (snap.val().interest) {
            const matchPercentage = await percentageMatch(
              currentUserArray,
              snap.val().interest
            );

            if (snap.key !== currentUser && snap.val().interest) {
              snap.val().interest.forEach((inst) => {
                if (inst.toLowerCase() === interest.toLowerCase()) {
                  interests.push({
                    ...snap.val(),
                    commonInterests: currentUserArray.filter((interest) =>
                      snap.val().interest.includes(interest)
                    ),
                    userId: snap.key,
                    matchPercentage,
                  });
                }
              });
            }
          }

          resolve();
        });

        promises.push(promise);
      });

      await Promise.all(promises);
    }
    interests.sort((x, y) => y.matchPercentage - x.matchPercentage);

    return interests;
  } catch (error) {
    throw new Error(error);
  }
};

module.exports = { NumberOfUsersWithInterest, UsersWithInterest };
