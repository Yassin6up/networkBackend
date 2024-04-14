const { getDatabase } = require("firebase-admin/database");
const UploadLocation = async ({ user, location }) => {
  await getDatabase()
    .ref(`users/${user}`)
    .update({
      location,
    })
    .then(async (result) => {
      return "added";
    })
    .catch((error) => {
      throw new Error(error);
    });
};
module.exports = {
  UploadLocation,
};
