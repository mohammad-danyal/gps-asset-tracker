const functions = require("firebase-functions");
const admin = require('firebase-admin');
const FieldValue = require('firebase-admin').firestore.FieldValue;

admin.initializeApp();

// auth trigger (user created)
exports.userCreate = functions.auth.user().onCreate(user => {
    userDoc = {email: user.email}
    return admin.firestore().collection('users').doc(user.uid).set(userDoc);
});
  
// auth trigger (user deleted)
exports.userDelete = functions.auth.user().onDelete(user => {
    const doc = admin.firestore().collection('users').doc(user.uid);
    return doc.delete();
});

// function retrieving GPS data from incoming HTTP POST 
exports.postmethod= functions.https.onRequest((request, response) => {
    var stream = JSON.stringify(request.body);
    var data = JSON.parse(stream);

    var latitude = data.decoded.payload.latitude;

    if (latitude != 0) {

        var longitude = data.decoded.payload.longitude;
        var reported_at = new Date(data.reported_at);

        if(data.decoded.payload.button == true) {
            admin.firestore().collection('devices').doc(data.dev_eui).update({
                battery_percent: data.decoded.payload.battery_percent,
                is_button: data.decoded.payload.button,
                last_update: FieldValue.arrayUnion(reported_at),
                last_button_press: reported_at,
                moving: data.decoded.payload.moving,
                location_data: FieldValue.arrayUnion(new admin.firestore.GeoPoint(latitude, longitude))
            });
        } else {

            admin.firestore().collection('devices').doc(data.dev_eui).update({
                battery_percent: data.decoded.payload.battery_percent,
                is_button: data.decoded.payload.button,
                last_update: FieldValue.arrayUnion(reported_at),
                moving: data.decoded.payload.moving,
                location_data: FieldValue.arrayUnion(new admin.firestore.GeoPoint(latitude, longitude))
            });

        }
        response.send("database updated");
    }
    response.send("request skipped");
});

// function retrieving data from the database regarding a user
exports.retrieveUserData = functions.https.onCall((data, context) => {
    const uid = data.uid;
    var userData;
    
    return new Promise(function(resolve, reject) {
        admin.firestore().collection('users').doc(uid).get().then((doc) => {
        if (doc.exists) {
        userData = doc.data()
        }
        resolve (userData)
    });
    })
});

// function retrieving data from the database regarding a device
exports.retrieveDeviceData = functions.https.onCall((data, context) => {
    const eui = data.eui;
    var deviceData;
    
    return new Promise(function(resolve, reject) {
        admin.firestore().collection('devices').doc(eui).get().then((doc) => {
        if (doc.exists) {
        deviceData = doc.data()
        }
        resolve (deviceData)
    });
    })
});

