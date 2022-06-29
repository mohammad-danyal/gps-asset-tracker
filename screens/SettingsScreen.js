import React, {useState, useEffect} from 'react';
import {Text, View, StyleSheet, SafeAreaView, ScrollView, StatusBar, TouchableOpacity, Modal, Pressable, TextInput} from 'react-native';
import { auth } from '../firebase'
import firebase from 'firebase/app';
import { useNavigation } from '@react-navigation/core'
import { globalVal } from './HomeScreen';
import { changeDocumentEmail } from '../components/utils.js';
import { FontAwesome5 } from '@expo/vector-icons'

const SettingsScreen = () => {

  const [showingModal, setShowingModal] = useState(false)

  const navigation = useNavigation()

  const handleSignout = () => {
    auth
    .signOut()
    .then(() => {
      globalVal.loggedOn = false;
      navigation.replace('Login', {screen: "Login"})
    })
    .catch(error => alert(error.message))
  }

  const handleAccountDetails = () => {
    setShowingModal(true);
  }

  return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center'}}>
      <SafeAreaView style={styles.container}>
      <ScrollView style={styles.scrollView}>
        <Text style={{fontSize: 22, marginBottom: 5, fontWeight: '500', color: '#222'}}>Account Settings </Text>
      <TouchableOpacity onPress={handleAccountDetails}>
         <Text style={[styles.button, styles.buttonOutlineText]}>Change Email</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={handleSignout}>
         <Text style={[styles.button, styles.buttonOutlineText, {top: 50}]}>Sign Out</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
    <AccountModal modalVisible={showingModal} setModalVisible={setShowingModal.bind(this)} />
    </View>
  );
  }

  const AccountModal = ({modalVisible, setModalVisible}) => {

    const [input, setInput] = useState('')

    const [heading, setHeading] = useState("Change Email Address")
    const [subheading, setSubheading] = useState("Current Email Address:")
    const [button, setButton] = useState("Save")

    const [currentEmail, setCurrentEmail] = useState(globalVal.userEmail)
    const [emailEntered, setEmailEntered] = useState(false)

    const [isUnchanged, setIsUnchanged] = useState(true)

    useEffect(() => {
      if (String(input).trim().length == 0) {
        setIsUnchanged(true)
      } else {
        setIsUnchanged(false)
      }
    }, [input])

    const changeEmail = () => {

      setIsUnchanged(true);

      if (emailEntered != true) {
        setHeading("Confirm Password");
        setSubheading("New Email Address:");
        setButton("Confirm");
        setCurrentEmail(input);
        setEmailEntered(true);
        setInput('');
        
      } else {
        const credential = firebase.auth.EmailAuthProvider.credential(globalVal.userEmail, input);

        firebase.auth().currentUser.reauthenticateWithCredential(credential).then(userCredentials => {
          const user = userCredentials.user;
          user.updateEmail(currentEmail);
          changeDocumentEmail(user.uid, currentEmail);
          globalVal.userEmail = currentEmail;

          firebase.auth().currentUser.reauthenticateWithCredential(credential).then(userCredentials => {
            const user = userCredentials.user;
            user.sendEmailVerification();
          })
        })

        setHeading("Change Email Address");
        setSubheading("Current Email Address:");
        setButton("Save");
        setEmailEntered(false);
        setInput('');


        setModalVisible(!modalVisible)

        alert("email changed !")

        globalVal.userEmail = currentEmail;
      }
  
    }

    const resetEmail = () => {
      setHeading("Change Email Address");
      setSubheading("Current Email Address:");
      setEmailEntered(false);
      setCurrentEmail(globalVal.userEmail)
      setInput('');
      setIsUnchanged(true);
    }

    return(
      <>
      <View style={styles.centeredView}>
      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => {
          Alert.alert("Modal has been closed.");
          setModalVisible(!modalVisible);
        }}
      >
        <View style={styles.centeredView}>
          <View style={styles.modalView}>

          <TouchableOpacity
          style={styles.closeButton}
      onPress={() => [setModalVisible(!modalVisible), resetEmail()]}
    >
      <FontAwesome5
              name="times"
              size={20}
              color={'black'}
             ></FontAwesome5>
      </TouchableOpacity>

            <Text style={{fontSize: 22, marginBottom: 5, fontWeight: '500', color: '#222', top: '5%'}}>{heading}</Text>
            <Text style={{top: '10%', fontSize: 15, fontWeight: '500'}}> {subheading} </Text>
            <Text style={{top: '10%', fontSize: 15}}> {currentEmail} </Text>
            <TextInput
            placeholder= "test"
            onChangeText={text => setInput(text)}
            value={input}
            style={styles.input}
            />
            
    <View style={{ flexDirection:"row" }}>
        <TouchableOpacity
        disabled={isUnchanged}
        style={[styles.modalButton, styles.buttonOutlineText, isUnchanged ? styles.modalButtonDisabled : styles.modalButton]}
        onPress={() => [changeEmail()]}
      >
        <Text style={styles.textStyle}>{button}</Text>
        </TouchableOpacity>
</View>


          </View>
        </View>
      </Modal>
    </View>
      </>
    )
  }

  export default SettingsScreen

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      paddingTop: StatusBar.currentHeight,
      width: '100%',
    },
    scrollView: {
      marginHorizontal: 20,
    },
    text: {
      fontSize: 42,
    },
    button: {
      width: "100%",
      backgroundColor: 'white',
      marginTop: 5,
      borderColor: 'grey',
      borderWidth: 2,
      borderRadius: 6,
      paddingHorizontal: 10,
      paddingVertical: 5,
    },
    closeButton: {
      position: 'absolute',
      top: '5%',
      right: '5%',
  },
    buttonOutlineText: {
      color: 'black',
      fontWeight: '700',
      fontSize: 16,
    },
    centeredView: {
      flex: 1,
      justifyContent: "center",
      alignItems: "center",
    },
    modalView: {
      width: "92%",
      height: "60%",
      marginTop: '90%',
      margin: '10%',
      backgroundColor: "white",
      borderRadius: 30,
      padding: 30,
      alignItems: "center",
      shadowColor: "#000",
      shadowOffset: {
        width: 0,
        height: 2
      },
      shadowOpacity: 0.25,
      shadowRadius: 4,
      elevation: 5
    },
    modalButton: {
      backgroundColor: 'black',
      width: '40%',
      padding: '5%',
      borderRadius: 10,
      bottom: '15%',
      top: '20%',
      position: 'relative'
    },
    modalButtonDisabled: {
      backgroundColor: 'black',
      width: '40%',
      padding: '5%',
      borderRadius: 10,
      bottom: '15%',
      top: '20%',
      position: 'relative',
      opacity: 0.2,
    },
    modelButtonOpen: {
      backgroundColor: "black",
    },
    modalButtonClose: {
      backgroundColor: "black",
    },
    textStyle: {
      color: "white",
      fontWeight: "bold",
      textAlign: "center"
    },
    modalText: {
      marginBottom: 15,
      textAlign: "center"
    },
    input: {
      backgroundColor: 'white',
      paddingHorizontal: 15,
      paddingVertical: 10,
      borderRadius: 10,
      borderColor: 'black',
      borderWidth: 2,
      marginTop: '20%',
      marginBottom: 10,
      width: '75%'
    },
  });