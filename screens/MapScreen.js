import React , {useState, useEffect} from 'react';
import { Dimensions, StyleSheet, View} from 'react-native';

//Maps
import MapView from 'react-native-maps';

import globalVal from '../components/globalVar';
import { getListOfMarkers, mapLocationData, mapDeviceData, mapButtonDeviceData, mapButtonEventMarkers } from '../components/utils.js';


const _ = require('lodash');

const MapScreen = () => {

  const [coordinates, setCoordinates] = useState(mapLocationData(globalVal.userDevices))
  const [devices, setDevices] = useState(mapDeviceData(globalVal.userDevices))
  const [buttonDevices, setButtonDevices] = useState(mapButtonDeviceData(globalVal.userDevices))

    const MINUTE_MS = 1000;
    
    useEffect(() => {
      const interval = setInterval(() => {
      const _data = mapLocationData(globalVal.userDevices)
      const _data2 = mapDeviceData(globalVal.userDevices)
      const _data3 = mapButtonDeviceData(globalVal.userDevices)
      setCoordinates(_data)
      setDevices(_data2)
      setButtonDevices(_data3)
    }, MINUTE_MS);
      
      return () => clearInterval(interval); // This represents the unmount function, in which you need to clear your interval to prevent memory leaks.
    
    }, [])

  if (coordinates[0] != null) {

    const listOfMarkers = getListOfMarkers(coordinates);

    const recentLatitude = listOfMarkers[0].latitude;
    const recentLongitude = listOfMarkers[0].longitude;

    var buttonMarkers = mapButtonEventMarkers(coordinates);

    return (
      <View style={styles.container}>
        <MapView style={styles.map} 
        initialRegion={{
          latitude: recentLatitude,
          longitude: recentLongitude,
          latitudeDelta: 0.05,
          longitudeDelta: 0.05
      }}
      >
        
        {
        coordinates.map((item)=> {
          return(
          <MapView.Polyline
          coordinates={item}
          strokeColor="#000" // fallback for when `strokeColors` is not supported by the map-provider
          strokeColors={[
            '#ff2800', 
          ]}
          strokeWidth={3}
          />
          )
          })
          }

             
        {
         _.zipWith(listOfMarkers, devices, function(a, b) {
          return(
            <MapView.Marker
            coordinate={a}
            pinColor = {"red"} // any color
            title={b.nickname}
            description={'Last Online: ' + b.last_update}
            />
            )
            })
          }
          
          
          {
         _.zipWith(buttonMarkers, buttonDevices, function(a, b) {
          return(
            <MapView.Marker
            coordinate={a}
            pinColor = {"blue"} // any color
            title={b.nickname}
            description={'Button Pressed: ' + b.last_update}
            />
            )
            })
          }
          
          </MapView>
      </View>
    );

  } else {

    return (
      <View style={styles.container}>
        <MapView style={styles.map} 
        initialRegion={{
          latitude: 53.643553560782166,
          longitude: -1.7781839306895144,
          latitudeDelta: 0.05,
          longitudeDelta: 0.05
      }}
      >
              
        </MapView>
      </View>

    );

  }
  }

  export default MapScreen

  const styles = StyleSheet.create({
    page: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      backgroundColor: '#F5FCFF'
    },
    container: {
      height: 300,
      width: 300,
      backgroundColor: 'tomato'
    },
    map: {
      width: Dimensions.get('window').width,
      height: Dimensions.get('window').height,
    },
});