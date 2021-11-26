import { StatusBar } from 'expo-status-bar';
import React, { useState, useEffect } from 'react';
import { Text, View, SafeAreaView, StyleSheet, Dimensions, Modal, TouchableOpacity, ActivityIndicator } from 'react-native';
import { BarCodeScanner } from 'expo-barcode-scanner';
import { WebView } from 'react-native-webview';

const { height, width } = Dimensions.get('window');

const urlExpression = /[-a-zA-Z0-9@:%_\+.~#?&//=]{2,256}\.[a-z]{2,4}\b(\/[-a-zA-Z0-9@:%_\+.~#?&//=]*)?/gi

export default function App() {
  const [hasPermission, setHasPermission] = useState(null);
  const [scanned, setScanned] = useState(false);
  const [barcodeData, setBarcodeData] = useState('');
  const [modalVisible, setModalVisible] = useState(false);

  useEffect(() => {
    (async () => {
      const { status } = await BarCodeScanner.requestPermissionsAsync();
      setHasPermission(status === 'granted');
    })();
  }, []);

  const handleBarCodeScanned = async ({ type, data }) => {
    try {
      setScanned(true);
      setBarcodeData(data);
      // const result = await WebBrowser.openBrowserAsync(data)
      setModalVisible(true);
    } catch (error) {
      console.log('barcode scan error: ', error)
    }
  };

  const scanAgain = () => {
    setScanned(false);
    setBarcodeData('');
    setModalVisible(false);
  }

  const _renderLoading = () => (
    <View style={styles.loading}>
      <ActivityIndicator color="black" />
    </View>
  )

  if (hasPermission === null) {
    return <Text>Requesting for camera permission</Text>;
  }
  if (hasPermission === false) {
    return <Text>No access to camera</Text>;
  }
  return (
    <SafeAreaView style={styles.container}>
      <Text style={[styles.boldText, styles.font19, { alignSelf: 'center' }]}>Qr Scanner</Text>
      <BarCodeScanner
        onBarCodeScanned={scanned ? undefined : handleBarCodeScanned}
        style={{ height: height - 250 }}
      />

      <Modal visible={modalVisible}>
        <View style={{ flex: 1 }}>
          <View style={styles.headerContainer}>
            <TouchableOpacity style={styles.closeButton} onPress={scanAgain}>
              <Text style={[styles.boldText, styles.font25]}>{`<`}</Text>
            </TouchableOpacity>
            <View style={styles.url}>
              <Text style={styles.boldText}>{barcodeData.length > 30 ? `${barcodeData.substring(0, 27)}...` : barcodeData}</Text>
            </View>
          </View>

          {
            !barcodeData.match(new RegExp(urlExpression))
              ?
              <View style={{ paddingTop: '5%', alignItems: 'center' }}>
                <Text>{`"${barcodeData}"`} is not an url!</Text>
              </View>
              :
              <WebView
                startInLoadingState={true}
                source={{ uri: barcodeData }}
                renderLoading={_renderLoading}
              />
          }

        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    justifyContent: 'center'
  },
  barcode: {
    flex: 7,
  },

  loading: {
    position: 'absolute',
    top: '50%',
    left: '50%',
    backgroundColor: '#fff'
  },

  headerContainer: {
    height: 50,
    width: '100%',
    backgroundColor: '#d3d3d3',
    justifyContent: 'space-between',
    flexDirection: 'row'
  },
  closeButton: {
    justifyContent: 'center',
    alignItems: 'center',
    width: '20%'
  },
  boldText: {
    fontWeight: 'bold',
    color: '#696969',
  },
  font25: {
    fontSize: 25
  },
  font19: {
    fontSize: 19
  },
  url: {
    justifyContent: 'center',
    width: '80%',
    paddingLeft: '5%',
  },

});
