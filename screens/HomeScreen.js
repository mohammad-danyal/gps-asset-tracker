import React, { useEffect, useState } from 'react'
import { StatusBar, Animated, Text, View, StyleSheet, TouchableOpacity, Modal, TextInput} from 'react-native';
import { addDeviceToUser, formatDeviceFlatList, isDeviceReal, assignNickname, getDeviceData } from '../components/utils.js';
import globalVal from '../components/globalVar';
import { FontAwesome5 } from '@expo/vector-icons'

const SPACING = 16;
const AVATAR_SIZE = 70;
const ITEM_SIZE = AVATAR_SIZE + SPACING * 3;

const HomeScreen = () => {
    const [data, setData] = useState([])
    const [currentData, setCurrentData] = useState([])
    const [currentIndex, setCurrentIndex] = useState()
    const MINUTE_MS = 1000;

    const [showingRegisterDeviceModal, setShowingRegisterDeviceModal] = useState(false)
    const [showingModal, setShowingModal] = useState(false)
        
    useEffect(() => {
      const interval = setInterval(() => {
      const _data = formatDeviceFlatList(globalVal.userDevices)
      setData(_data)
      setCurrentData(_data);
    }, MINUTE_MS);
      
      return () => clearInterval(interval); // Represents the unmount function, in which you need to clear your interval to prevent memory leaks.
    
    }, [])
    
    const handleRegisterDevice = () => {
    setShowingRegisterDeviceModal(true);
  }

  const handleViewDevice = () => {
    setShowingModal(true);
  }

  /*************************************************************************************
*    A React Native scroll item animation effect using Animated API.
*    This was adapted from a video made by Catalin Miron on January 20th 2021
*    Video is found here: https://www.youtube.com/watch?v=F8x-dyIsrJ8
*
***************************************************************************************/

    const scrollY = React.useRef(new Animated.Value(0)).current;
    return <View style={styles.container}>
        <StatusBar hidden/>
        
        <Animated.FlatList
            data={data}
            keyExtractor={item => item.key}
            contentContainerStyle={{padding: SPACING, paddingTop: StatusBar.currentHeight || 40, paddingBottom: StatusBar.currentHeight || 80}}
            onScroll={Animated.event(
                [{nativeEvent: {contentOffset: {y: scrollY}}}],
                {useNativeDriver: true }
            )}
            renderItem={({item, index}) => {
                const scale = scrollY.interpolate({
                    inputRange: [-1, 0, ITEM_SIZE * index, ITEM_SIZE * (index + 2)],
                    outputRange: [1, 1, 1, 0],
                })
                const opacity = scrollY.interpolate({
                    inputRange: [-1, 0, ITEM_SIZE * index, ITEM_SIZE * (index + 1)],
                    outputRange: [1, 1, 1, 0],
                })
                
                return <TouchableOpacity onPress={ ()=> {setCurrentData(data); setCurrentIndex(index); handleViewDevice() }}><Animated.View style={{flexDirection: 'row', alignItems: 'center', backgroundColor: 'rgba(255,255,255,0.85)', marginBottom: SPACING, padding: SPACING, borderRadius: 12,
                    shadowColor: '#000',
                    shadowRadius: 30,
                    shadowOpacity: .2,
                    shadowOffset: {
                        width: 0,
                        height: 40
                    },
                    opacity,
                    transform: [{scale}]
                }}>
                  
                    <View>
                        <Text style={{fontSize: 22,marginBottom: 5, fontWeight: '500', color: '#222'}}>{item.nickname}</Text>
                        <Text style={{fontSize: 13, marginBottom: 8, letterSpacing: 1, opacity: .7}}>{"devEUI: " + item.dev_eui}</Text>
                        <Text style={{fontSize: 13, marginBottom: 8, letterSpacing: 1, opacity: .7}}>{"Last Online: " + item.last_update}</Text>
                        <Text style={{fontSize: 11, fontFamily: 'Menlo', opacity: .7, color: 'blue'}}>{"Battery: " + item.battery_percent + "%"}</Text>

                    </View>
                </Animated.View>
                </TouchableOpacity>
            }}
        />
        <ViewDeviceModal item = {currentData} setCurrentData = {setCurrentData.bind(this)} index = {currentIndex} setCurrentIndex = {setCurrentIndex.bind(this)} modalVisible={showingModal} setModalVisible={setShowingModal.bind(this)} />
        <RegisterDeviceModal modalVisible={showingRegisterDeviceModal} setModalVisible={setShowingRegisterDeviceModal.bind(this)} />
        <TouchableOpacity 
        style={styles.addButton}
        onPress={handleRegisterDevice}>
            <FontAwesome5
              name="plus"
              size={20}
              color={'white'}
            ></FontAwesome5>

        </TouchableOpacity>
    </View>
}


const ViewDeviceModal = ({item, index, modalVisible, setModalVisible}) => {
  const [nickname, setNickname] = useState()
  const [isUnchanged, setIsUnchanged] = useState(true)

  useEffect(() => {
    if (index != null) {
      if ((nickname === item[index].nickname) || (String(nickname).trim().length == 0)) {
        setIsUnchanged(true)
      } else {
        setIsUnchanged(false)
      }
  }
  }, [nickname])

  const changeNickname = () => {
    if (nickname != '') {
      assignNickname(item[index].dev_eui, nickname)
      setModalVisible(!modalVisible)
    } else {
      alert("Nickname has been left empty")
    }
    setIsUnchanged(true)
  }

  const reset = () => {
    setModalVisible(!modalVisible);
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
        alert("Modal has been closed.");
        setModalVisible(!modalVisible);
      }}
    >
      <View style={styles.centeredView}>
        <View style={styles.modalView}>

          <TouchableOpacity
          style={styles.closeButton}
      onPress={() => [reset()]}
    >
      <FontAwesome5
              name="times"
              size={20}
              color={'black'}
             ></FontAwesome5>
      </TouchableOpacity>
             
          <Text style={{fontSize: 22, marginBottom: 5, fontWeight: '500', color: '#222', top: '5%'}}>Device Information</Text>

          <View style={{ flexDirection:"row" }}>
             <Text style={{top: '20%', fontSize: 15, fontWeight: '500', paddingBottom: '5%', minWidth: '50%'}}> Nickname: </Text>
              <TextInput
            onChangeText={text => setNickname(text)}
            defaultValue={index == null ? '' : item[index].nickname}
            style={{ backgroundColor: 'white',
            paddingHorizontal: 2,
            paddingVertical: 5,
            borderRadius: 10,
            borderColor: 'black',
            borderWidth: 2,
            marginTop: '20%',
            width: '50%'}}
            />
          </View>

          <View style={{ flexDirection:"row" }}>
             <Text style={{ paddingTop: '10%', fontSize: 15, fontWeight: '500', paddingBottom: '5%', minWidth: '50%'}}> DevEUI: </Text>
             <Text style={{ paddingTop: '10%', fontSize: 15, fontWeight: '500', paddingBottom: '5%', minWidth: '50%'}}> {index == null ? '' : item[index].dev_eui} </Text>
          </View>

          <View style={{ flexDirection:"row" }}>
             <Text style={{ paddingTop: '10%', fontSize: 15, fontWeight: '500', paddingBottom: '5%', minWidth: '50%'}}> Last Online: </Text>
             <Text style={{ paddingTop: '10%', fontSize: 15, fontWeight: '500', paddingBottom: '5%', minWidth: '50%'}}> {index == null ? '' : item[index].last_update} </Text>
          </View>

          <View style={{ flexDirection:"row" }}>
             <Text style={{ paddingTop: '10%', fontSize: 15, fontWeight: '500', paddingBottom: '5%', minWidth: '50%'}}> Battery: </Text>
             <Text style={{ paddingTop: '10%', fontSize: 15, fontWeight: '500', paddingBottom: '5%', minWidth: '50%'}}> {index == null ? '' : item[index].battery_percent} </Text>
          </View>
          

      <TouchableOpacity
      disabled = {isUnchanged}
      style={[styles.modalButton, styles.buttonOutlineText, isUnchanged ? styles.modalButtonDisabled : styles.modalButton]}
      onPress={() => [changeNickname()]}
    >
      <Text style={styles.textStyle}>Save</Text>
      </TouchableOpacity>


        </View>
      </View>
    </Modal>
    </View>
    </>
  )

  }

export default HomeScreen

const RegisterDeviceModal = ({modalVisible, setModalVisible}) => {
  
    const [eui, setEui] = useState('')
    const [isUnchanged, setIsUnchanged] = useState(true)

    useEffect(() => {
      if ((String(eui).trim().length == 0)) {
         setIsUnchanged(true)
        } else {
          setIsUnchanged(false)
        }
    }, [eui])

    const registerDevice = async () => {
        const deviceEui = String(eui).trim();
        const exists = await isDeviceReal(deviceEui)
        if (exists == true) {
          const deviceData = await getDeviceData(deviceEui)
          if (String(deviceData.data.assigned_user).trim().length == 0) {
            addDeviceToUser(globalVal.userUID, deviceEui);
            setModalVisible(!modalVisible)
          } else {
            alert("This device is already in use by another user")
          }
        } else {
            alert("Device does not exist")
        }
        setEui(null);
        setIsUnchanged(true)
    }

    const reset = () => {
      setModalVisible(!modalVisible);
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
          alert("Modal has been closed.");
          setModalVisible(!modalVisible);
        }}
      >
        <View style={styles.centeredView}>
          <View style={styles.modalView}>
             <TouchableOpacity
          style={styles.closeButton}
      onPress={() => [reset()]}
    >
      <FontAwesome5
              name="times"
              size={20}
              color={'black'}
             ></FontAwesome5>
      </TouchableOpacity>
            <Text style={{fontSize: 22, marginBottom: 5, fontWeight: '500', color: '#222', top: '5%'}}>Add Device</Text>
            <Text style={{top: '10%', fontSize: 15, fontWeight: '500'}}> Enter the DevEUI </Text>
            <TextInput
            onChangeText={text => setEui(text)}
            style={styles.input}
            />
            

        <TouchableOpacity
        disabled={isUnchanged}
        style={[styles.modalButton, styles.buttonOutlineText, isUnchanged ? styles.modalButtonDisabled : styles.modalButton]}
        onPress={() => [registerDevice()]}
      >
        <Text style={styles.textStyle}>Add</Text>
        </TouchableOpacity>

          </View>
        </View>
      </Modal>
      </View>
      </>
    )
  
    }

export {globalVal};

const styles = StyleSheet.create({
    container: {
        flex: 1, 
        backgroundColor: 'white',
    },
    addButton: {
        position: 'absolute',
        bottom: '12%',
        right: '5%',
        padding: 10,
        borderRadius: 10,
        backgroundColor: 'black',
    },
    closeButton: {
      position: 'absolute',
      top: '5%',
      right: '5%',
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
        padding: '10%',
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
        top: '7%',
        position: 'relative'
      },
      modalButtonDisabled: {
        backgroundColor: 'black',
        width: '40%',
        padding: '5%',
        borderRadius: 10,
        top: '10%',
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

  })