import firebase from 'firebase/app';
import TimeAgo from 'javascript-time-ago'
import en from 'javascript-time-ago/locale/en.json'
import globalVal from '../components/globalVar';

// Function that takes a user UID number and retrieves all the associated device(s) data
export async function retrieveData(uid) {
    const r = await getUserData(uid);
    if (r.data != null) {
    globalVal.numberOfDevices = Object(r.data.devices).length;
    var arrayOfDeviceData = new Array();

    for(var i = 0; i < globalVal.numberOfDevices; i++) {
                
        const deviceData = await getDeviceData(r.data.devices[i])
        arrayOfDeviceData.push(deviceData)
    }           
    return arrayOfDeviceData;
} else {
    return null;
}
}

// Function that takes a user UID number and retrieves all the data associated with it
async function getUserData(uid) {
    
    const retrievUser = firebase.functions().httpsCallable('retrieveUserData');
    const result = await retrievUser({uid: uid});
    return result;
}

// Function that takes a devices EUI number and retrieves all the data associated with it
export async function getDeviceData(eui) {
    
    const retrieveDevice = firebase.functions().httpsCallable('retrieveDeviceData');
    const result = await retrieveDevice({eui: eui});
    return result;
    
}

// Function that takes device location data and creates an array of latlang arrays for each of the devices owned by the user
export function mapLocationData(deviceData) {
    var array = new Array();
    var points = new Array();

    if (globalVal.numberOfDevices != 0) {

        for(var i = 0; i < globalVal.numberOfDevices; i++) {
            points = [];
            var locationData = getLocationData(deviceData, i);
            const numberOfPoints = Object(locationData).length;
            
            for(var j = 0; j < numberOfPoints; j++) {
                points.push({
                  latitude: locationData[j]._latitude,
                  longitude: locationData[j]._longitude
                })
            }
            array.push(points);
        }
        return array;

    } else {
        return null;
    }
    
}

// Function that retrieves details regarding location marker points to be used alongside the markers
export function mapDeviceData(deviceData) {
    var points = new Array();
    
    TimeAgo.setDefaultLocale(en.locale)
    TimeAgo.addLocale(en)
    
    // Create formatter (English).
    const timeAgo = new TimeAgo('en-US')


    if (globalVal.numberOfDevices != 0) {

        for(var i = 0; i < globalVal.numberOfDevices; i++) {
            var devData = deviceData[i].data;
            const date = new Date(devData.last_update[Object(devData.last_update).length - 1]._seconds * 1000);

                points.push({
                  nickname: devData.nickname,
                  last_update: timeAgo.format(date),
                })
        }
        return points;

    } else {
        return null;
    }
    
}

// Function that retrieves details regarding button events to be used alongside the markers
export function mapButtonDeviceData(deviceData) {
    var points = new Array();
    
    TimeAgo.setDefaultLocale(en.locale)
    TimeAgo.addLocale(en)
    
    // Create formatter (English).
    const timeAgo = new TimeAgo('en-US')


    if (globalVal.numberOfDevices != 0) {

        for(var i = 0; i < globalVal.numberOfDevices; i++) {

            var devData = deviceData[i].data;
            const date = new Date(devData.last_update[Object(devData.last_update).length - 1]._seconds * 1000);

            var numberOfPresses = Object(devData.last_button_press).length;
            
            for(var j = 0; j < numberOfPresses; j++) { 
                points.push({
                    nickname: devData.nickname,
                    last_update: timeAgo.format(date),
                })
            }
        }
        return points;

    } else {
        return null;
    }
    
}

// Function that retrieves user device location data relatinng to button_press timestamps and stores it in an array
export function mapButtonEventMarkers() {
    var points = new Array();

    if (globalVal.numberOfDevices != 0) {

        for(var i = 0; i < globalVal.numberOfDevices; i++) {

            var location_data = globalVal.userDevices[i].data.location_data;
            var buttonPresses = globalVal.userDevices[i].data.last_button_press;
            var updates = globalVal.userDevices[i].data.last_update;
            var numberOfPresses = Object(buttonPresses).length;
            
            for(var j = 0; j < numberOfPresses; j++) {
                var index = updates.findIndex(item => item._seconds === buttonPresses[j]._seconds);

                if (index != -1) {
                    points.push({
                        latitude: location_data[index]._latitude,
                        longitude: location_data[index]._longitude
                      })
                }
            }

        }

        return points;

    } else {
        return null;
    }
    
}

// Function that retrieves location data for a given entry
export function getLocationData(data, i) {

    return data[i].data.location_data;
    
}

// Function that takes user device data and converts it to a FlatList format
export function formatDeviceFlatList(data) {

    TimeAgo.setDefaultLocale(en.locale)
    TimeAgo.addLocale(en)
    
    // Create formatter (English).
    const timeAgo = new TimeAgo('en-US')
    var array = new Array();

    for(var i = 0; i < globalVal.numberOfDevices; i++) {

        const date = new Date(data[i].data.last_update[Object(data[i].data.last_update).length - 1]._seconds * 1000);

        array[i] = {
            nickname: data[i].data.nickname,
            dev_eui: data[i].data.dev_eui,
            last_update: timeAgo.format(date),
            battery_percent: (Math.round(data[i].data.battery_percent)),
        }

    }

    return array;

}

// Function that takes a user uid and updates the email address associated with it on firestore
export function changeDocumentEmail(uid, newEmail) {

    firebase.firestore().collection('users').doc(uid).update({
        emaidevl: newEmail
    })
    
}

// Function that takes a device eui number and checks if it exists in the devices collection
export async function isDeviceReal(eui) {

    const doc = await firebase.firestore().collection('devices').doc(eui).get();

    if (doc.exists) {
        return true
    } else if (!doc.exists) {
        return false
    }
    
}

// Function that asscociates a device eui with a user uid
export function addDeviceToUser(uid, eui) {

    firebase.firestore().collection('users').doc(uid).update({
        devices: firebase.firestore.FieldValue.arrayUnion(eui)
    })

    firebase.firestore().collection('devices').doc(eui).update({
        assigned_user: uid
    })
    
}

// Function that retrieves a list of markers for all the devices on a network
export function getListOfMarkers(data) {
    var markers = new Array();
    for(var i = 0; i < globalVal.numberOfDevices; i++) {
        markers.push({
            latitude: data[i][Object(data[i]).length - 1].latitude,
            longitude: data[i][Object(data[i]).length - 1].longitude
          })
    }
    return markers;
}

// Function that updates a nickname for a given device
export function assignNickname(eui, nickname) {

    firebase.firestore().collection('devices').doc(eui).update({
        nickname: nickname
    })
    
}