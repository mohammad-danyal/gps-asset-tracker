import { useNavigation } from '@react-navigation/core'
import React, { useEffect, useState } from 'react'
import { KeyboardAvoidingView, StyleSheet, Text, TextInput, TouchableOpacity, View, Image } from 'react-native'
import { auth } from '../firebase'
import { retrieveData } from '../components/utils.js';
import globalVal from '../components/globalVar';
import firebase from 'firebase/app';

const LoginScreen = () => {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')


  const navigation = useNavigation()

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(async user => {
      if ((user) && (user.emailVerified)) {

        globalVal.userDevices = await retrieveData(user.uid);
        globalVal.loggedOn = true;
        globalVal.userEmail = user.email;
        globalVal.userUID = user.uid;
        navigation.navigate("Menu")
        observer();
        

      } else if ((user) && (!user.emailVerified)) {
        alert('Check your emails for a verification link');
        auth.signOut()
      }
    })

    return unsubscribe
  }, [])

  const observer = () => { 
    
    firebase.firestore().collection('devices').where('assigned_user', '==', globalVal.userUID)
    .onSnapshot(querySnapshot => {
      querySnapshot.docChanges().forEach(change => {

        const changedDoc = change.doc.data()
        const currentEui = changedDoc.dev_eui

        for(var i = 0; i < globalVal.numberOfDevices; i++) {
                
          if (globalVal.userDevices[i].data.dev_eui == currentEui) {

            if (changedDoc.battery_percent != globalVal.userDevices[i].data.battery_percent) {
              globalVal.userDevices[i].data.battery_percent = changedDoc.battery_percent;
            }

            if (changedDoc.is_button != globalVal.userDevices[i].data.is_button) {
              globalVal.userDevices[i].data.is_button = changedDoc.is_button;
            }

            var formattedLocalUpdates = JSON.stringify(globalVal.userDevices[i].data.last_update).replace(/_/g, '');

            if (JSON.stringify(changedDoc.last_update) != formattedLocalUpdates) {
              var formattedNewUpdates = JSON.stringify(changedDoc.last_update).replace(/se/g, '_se'); 
              delete globalVal.userDevices[i].data.last_update
              globalVal.userDevices[i].data.last_update = JSON.parse(formattedNewUpdates)
            }

            var formattedLocalButtonPresses = JSON.stringify(globalVal.userDevices[i].data.last_button_press).replace(/_/g, '');

            if (JSON.stringify(changedDoc.last_button_press) != formattedLocalButtonPresses) {
              var formattedNewButtonPresses = JSON.stringify(changedDoc.last_button_press).replace(/se/g, '_se'); 
              delete globalVal.userDevices[i].data.last_button_press
              globalVal.userDevices[i].data.last_button_press = JSON.parse(formattedNewButtonPresses)
            }

            var formattedLocalLocations = JSON.stringify(globalVal.userDevices[i].data.location_data).replace(/_/g, '');

            if (JSON.stringify(changedDoc.location_data) != formattedLocalLocations) {
              var formattedNewLocations = JSON.stringify(changedDoc.location_data).replace(/l/g, '_l'); 
              delete globalVal.userDevices[i].data.location_data
              globalVal.userDevices[i].data.location_data = JSON.parse(formattedNewLocations)
            }

            if (changedDoc.moving != globalVal.userDevices[i].data.moving) {
              globalVal.userDevices[0].data.moving = changedDoc.moving;
            }

            if (changedDoc.nickname != globalVal.userDevices[i].data.nickname) {
              globalVal.userDevices[i].data.nickname = changedDoc.nickname;
            }
          }
        }       

      }
      );

    })
  }

  const handleSignUp = () => {
    auth
      .createUserWithEmailAndPassword(email, password)
      .then(userCredentials => {
        const user = userCredentials.user;
        console.log('Registered with:', user.email);
        user.sendEmailVerification()
      })
      .catch(error => alert(error.message))
  }

  const handleLogin = () => {
    auth
      .signInWithEmailAndPassword(email, password)
      .then(userCredentials => {
        const user = userCredentials.user;
        console.log('Logged in with:', user.email);
      })
      .catch(error => alert(error.message))
  }

  const handlePasswordReset = () => {
    auth
      .sendPasswordResetEmail(email)
      .then(function () {
        alert('Check your emails for a password reset link')
    }).catch(function (e) {
        console.log(e)
    }) 
  }

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior="padding"
    >
      <Image source={require('../assets/loginLogo.png')} style={{marginBottom: '10%', marginLeft: '6%'}} />
      <View style={styles.inputContainer}>
        <TextInput
          placeholder="Email"
          value={email}
          onChangeText={text => setEmail(text)}
          style={styles.input}
        />
        <TextInput
          placeholder="Password"
          value={password}
          onChangeText={text => setPassword(text)}
          style={styles.input}
          secureTextEntry
        />
      </View>

      <View style={styles.buttonContainer}>
        <TouchableOpacity
          onPress={handleLogin}
          style={styles.button}
        >
          <Text style={styles.buttonText}>Login</Text>
        </TouchableOpacity>
        <TouchableOpacity
          onPress={handleSignUp}
          style={[styles.button, styles.buttonOutline]}
        >
          <Text style={styles.buttonOutlineText}>Register</Text>
        </TouchableOpacity>
        <TouchableOpacity
          onPress={handlePasswordReset}
          style={{top: 20}}
        >
          <Text style={styles.buttonOutlineText}>Reset Password</Text>
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  )
}

export {globalVal};
export default LoginScreen

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  inputContainer: {
    width: '80%'
  },
  input: {
    backgroundColor: 'white',
    paddingHorizontal: 15,
    paddingVertical: 10,
    borderRadius: 10,
    marginTop: 5,
  },
  buttonContainer: {
    width: '60%',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 40,
  },
  button: {
    backgroundColor: 'black',
    width: '100%',
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
  },
  buttonOutline: {
    backgroundColor: 'white',
    marginTop: 5,
    borderColor: 'black',
    borderWidth: 2,
  },
  buttonOutlineText: {
    color: 'black',
    fontWeight: '700',
    fontSize: 16,
  },
  buttonText: {
    color: 'white',
    fontWeight: '700',
    fontSize: 16,
  },
})