var admin = require("firebase-admin");
var express = require('express');
var bodyParser = require('body-parser');
var cors = require('cors');

var serviceAccount = require("../mariposa-digital-fb-firebase-adminsdk-fbsvc-53f09e8c94.json");

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: "https://mariposa-digital-fb-default-rtdb.firebaseio.com"
});

const app = express();
app.use(bodyParser.json());
app.use(cors()); // Add this line to enable CORS

// Endpoint to delete a user
app.post('/deleteUser', async (req, res) => {
  const { uid } = req.body;

  try {
    await admin.auth().deleteUser(uid);
    await admin.database().ref(`users/${uid}`).remove();
    res.status(200).send({ message: 'User deleted successfully' });
  } catch (error) {
    res.status(500).send({ error: error.message });
  }
});

app.post('/updateUser', async (req, res) => {
  const { uid, email, password } = req.body;

  try {
    const updateData = {};
    if (email) updateData.email = email;
    if (password) updateData.password = password;

    await admin.auth().updateUser(uid, updateData);
    res.status(200).send({ message: 'User updated successfully' });
  } catch (error) {
    res.status(500).send({ error: error.message });
  }
});

app.get('/getUser', async (req, res) => {
  const { uid } = req.query;

  try {
    const userRecord = await admin.auth().getUser(uid);
    const userSnapshot = await admin.database().ref(`users/${uid}`).once('value');
    const userData = userSnapshot.val();

    res.status(200).send({ userRecord, userData });
  } catch (error) {
    res.status(500).send({ error: error.message });
  }
});

app.post('/changePassword', async (req, res) => {
  const { uid, newPassword } = req.body;

  try {
    await admin.auth().updateUser(uid, { password: newPassword });
    res.status(200).send({ message: 'Password updated successfully' });
  } catch (error) {
    res.status(500).send({ error: error.message });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});