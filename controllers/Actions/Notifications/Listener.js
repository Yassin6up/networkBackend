const { getDatabase } = require("firebase-admin/database");

const Listenser = async () => {
  const chatRef = getDatabase().ref("dms");
  chatRef.on("child_added", (snapshot) => {
    const changedPost = snapshot.val();
    console.log(JSON.stringify(changedPost, null, 2));
  });
};
module.exports = { Listenser };
