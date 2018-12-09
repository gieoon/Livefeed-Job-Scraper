
const admin = require('firebase-admin');

let serviceAccount = require("../livefeed-jobs-6382d2e3bbc4.json");
admin.initializeApp({
	credential: admin.credential.cert(serviceAccount)
});

const db = admin.firestore();
module.exports = db;




// var rootRef = db.collection('UoA').doc('data');

// var user = rootRef.set({
// 	title: 'where',
// 	last: 'lovelace',
// 	born: 2016
// });

// const firestore = new Firestore();
// const settings = {timestampsInSnapshots: true};
// firestore.settings(settings);


  // // Old:
  // const date = snapshot.get('created_at');
  // // New:
  // const timestamp = snapshot.get('created_at');
  // const date = timestamp.toDate();

