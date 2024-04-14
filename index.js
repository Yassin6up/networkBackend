const express = require("express");
const admin = require("firebase-admin");
const { fetchAndListMajors } = require("./controllers/camps/ListOfCamps.js");
const serviceAccount = require("./x.json");
const { profilerouter } = require("./routes/profileroutes.js");
const { chatsRouter } = require("./routes/chats.js");
const { matchrouter } = require("./routes/matchroutes.js");
const { postrouter } = require("./routes/post.js");
const { storiesrouter } = require("./routes/storiesroutes.js");
const { interestrouter } = require("./routes/interestroute.js");
const {
  RecentlyJoinedUsers,
} = require("./controllers/Profile/RecentlyJoinedUsers.js");
const {
  Listenser,
} = require("./controllers/Actions/Notifications/Listener.js");
const {
  ChatListenser,
} = require("./controllers/Actions/Notifications/ChatListener.js");
const {
  LikeListener,
} = require("./controllers/Actions/Notifications/LikeListener.js");
const {
  CommentsListener,
} = require("./controllers/Actions/Notifications/CommentsListener.js");
const { notificationrouter } = require("./routes/notificationroute.js");
const port = process.env.PORT || 3006;
const app = express();
app.use(express.json());
require("dotenv").config();
// Initialize Firebase Admin SDK
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: "https://datingapp-56d4e-default-rtdb.firebaseio.com/",
})
console.log("Firebase connected");


app.use("/profile", profilerouter);
app.use("/chats", chatsRouter);
app.use("/matches", matchrouter);
app.use("/posts", postrouter);
app.use("/stories", storiesrouter);
app.use("/interests", interestrouter);
app.use("/notifications", notificationrouter);
let number = 1;
setInterval(() => {
  number++;
  console.log(number);
}, 57000);
const chatlisten = ChatListenser();
const likelisten = LikeListener();
const commentslisten = CommentsListener();

app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).json({ error: "An error occurred" });
});

// Start the Express server
app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
