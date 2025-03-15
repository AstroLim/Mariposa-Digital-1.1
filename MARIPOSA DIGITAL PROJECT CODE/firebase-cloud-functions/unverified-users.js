const functions = require('firebase-functions');
const admin = require('firebase-admin');
admin.initializeApp();

const db = admin.database();
const auth = admin.auth();

exports.deleteUnverifiedUsers = functions.pubsub.schedule('every 24 hours').onRun(async (context) => {
  const now = Date.now();
  const cutoff = now - 7 * 24 * 60 * 60 * 1000; // 7 days ago

  const unverifiedUsersRef = db.ref('users').orderByChild('registrationTimestamp').endAt(cutoff);
  const snapshot = await unverifiedUsersRef.once('value');

  const deletePromises = [];

  snapshot.forEach((childSnapshot) => {
    const user = childSnapshot.val();
    if (!user.emailVerified) {
      const userId = childSnapshot.key;
      deletePromises.push(auth.deleteUser(userId).then(() => {
        return db.ref('users/' + userId).remove();
      }));
    }
  });

  await Promise.all(deletePromises);
  console.log('Deleted unverified users:', deletePromises.length);
});