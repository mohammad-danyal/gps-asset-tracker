import React from 'react';
import { View } from 'react-native';
import 'react-native-gesture-handler';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { FontAwesome5 } from '@expo/vector-icons'
import HomeScreen from './HomeScreen';
import MapScreen from './MapScreen';
import SettingsScreen from './SettingsScreen';

const Tab = createBottomTabNavigator();

const MenuScreen = () => {
  return (
   
    <Tab.Navigator screenOptions={
      {
        tabBarShowLabel: false,
        tabBarStyle: [
          {
            position: "absolute",
            backgroundColor : 'white',
          },
        ]
      }}>

      <Tab.Screen name={"Home"} component={HomeScreen} options={{
        headerShown: false, 
        tabBarIcon: ({ focused }) => (
          <View style={{
            position: 'absolute',
            top: 20
          }}>
            <FontAwesome5
              name="home"
              size={20}
              color={focused ? 'black' : 'gray'}
            ></FontAwesome5>
          </View>
        )
      }} ></Tab.Screen>

      <Tab.Screen name={"Map"} component={MapScreen} options={{
        headerShown: false, 
        tabBarIcon: ({ focused }) => (
          <View style={{
            position: 'absolute',
            top: 20
          }}>
            <FontAwesome5
              name="map"
              size={20}
              color={focused ? 'black' : 'gray'}
            ></FontAwesome5>
          </View>
        )
      }} ></Tab.Screen>

      <Tab.Screen name={"Settings"} component={SettingsScreen} options={{
        headerShown: false, 
        tabBarIcon: ({ focused }) => (
          <View style={{
            position: 'absolute',
            top: 20
          }}>
            <FontAwesome5
              name="user-alt"
              size={20}
              color={focused ? 'black' : 'gray'}
            ></FontAwesome5>
          </View>
        )
      }} ></Tab.Screen>

    </Tab.Navigator>
   
  );
}

export default MenuScreen