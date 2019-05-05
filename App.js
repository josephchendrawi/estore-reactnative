import React, {Component} from 'react';
import { View, AppState, ScrollView, Dimensions, KeyboardAvoidingView, Platform, StatusBar, BackHandler, Alert } from 'react-native';

import { Router, Scene, Stack } from 'react-native-router-flux';
import { connect } from 'react-redux';
import Icon from 'react-native-vector-icons/AntDesign';

import codePush from "react-native-code-push";

import colorPalette from './src/styles/colorPalatte';

import { updateGeneralInfo } from './src/actions/generalAction';

import * as API from './src/api/base';

import SplashScreen from './src/screens/SplashScreen';
import LoginScreen from './src/screens/LoginScreen';
import RegisterScreen from './src/screens/RegisterScreen';
import VerifyEmailScreen from './src/screens/VerifyEmailScreen';
import VerifyPhoneScreen from './src/screens/VerifyPhoneScreen';
import HomeScreen from './src/screens/HomeScreen';
import CatalogScreen from './src/screens/CatalogScreen';
import CartScreen from './src/screens/CartScreen';
import OrderScreen from './src/screens/OrderScreen';
import AccountScreen from './src/screens/AccountScreen';
import ProductDetailsScreen from './src/screens/ProductDetailsScreen';
import ProductScreen from './src/screens/ProductScreen';
import ProfileScreen from './src/screens/ProfileScreen';
import ChatScreen from './src/screens/ChatScreen';
import InfoScreen from './src/screens/InfoScreen';

const appContainerHeight = Dimensions.get("window").height - (Platform.OS == 'android' ? StatusBar.currentHeight : 0);

class App extends Component {
  state = {
    showSplashScreen : true,
    appState: AppState.currentState,
  }

  componentDidMount(){
    BackHandler.addEventListener('hardwareBackPress', this.backPressed);
    this.doUpdateGeneralInfo(() => {this.setState({showSplashScreen: false})});

    // AppState handler
    AppState.addEventListener('change', this._handleAppStateChange);
  }

  componentWillUnmount() {
    BackHandler.removeEventListener('hardwareBackPress', this.backPressed);
    AppState.removeEventListener('change', this._handleAppStateChange);
  }

  backPressed = () => {
    Alert.alert(
      null,
      'Do you want to exit?',
      [
        {text: 'No', onPress: () => {}, style: 'cancel'},
        {text: 'Yes', onPress: () => BackHandler.exitApp()},
      ],
      { cancelable: false });
      return true;
  }

  _handleAppStateChange = (nextAppState) => {
    if (this.state.appState.match(/background/) && nextAppState === 'active') {
      //console.warn('App has come to the foreground');

      //every time app come to foreground, update general info
      this.doUpdateGeneralInfo();
    }

    this.state.appState = nextAppState;
  }

  doUpdateGeneralInfo = (successCallback) => {
    API.GetInfoRequest()
    .then((response) => {
      if(response.data.sts == 0){
        this.props.updateGeneralInfo(response.data.result);
        if(successCallback != undefined) successCallback();
      }
      else{
        Alert.alert(null, response.data.msg);
      }
    })
    .catch((error)=>{
      Alert.alert(null, error.message);
    });
  }
  
  render() {
    return (
      this.state.showSplashScreen ?
      <SplashScreen />
      :
      <KeyboardAvoidingView behavior="padding" style={{flex: 1}} enabled={Platform.OS != 'android'}>
        <ScrollView contentContainerStyle={{height: appContainerHeight}} bounces={false} keyboardShouldPersistTaps="handled">
          <Router backAndroidHandler={() => {}}>
            <Scene key="root" hideNavBar>
              <Scene key='tabs' tabs tabBarPosition='bottom' activeBackgroundColor={colorPalette.primary} inactiveBackgroundColor={colorPalette.primary} activeTintColor={colorPalette.primaryText} inactiveTintColor={colorPalette.inactive} labelStyle={{marginBottom: 7, fontSize: 13}} tabBarStyle={{height: 62}}>
                <Scene icon={TabIcon} iconName="home" tabBarLabel='Home'>
                  <Scene key="home" title='Home' component={HomeScreen} hideNavBar />
                  <Scene key="productdetails" title='Product Details' component={ProductDetailsScreen} hideNavBar hideTabBar />
                  <Scene key="chat" title='Chat' component={this.props.loggedInUser.userName != undefined ? ChatScreen : LoginScreen} hideNavBar hideTabBar />
                  <Scene key='product' title='Product' component={ProductScreen} hideNavBar />
                </Scene>
                <Scene icon={TabIcon} iconName="database" tabBarLabel='Catalog'>
                  <Scene key='catalog' title='Catalog' component={CatalogScreen} hideNavBar />
                  <Scene key='product' title='Product' component={ProductScreen} hideNavBar />
                  <Scene key="productdetails" title='Product Details' component={ProductDetailsScreen} hideNavBar hideTabBar />
                </Scene>
                <Scene key='cart' title='Cart' component={this.props.loggedInUser.userName != undefined ? CartScreen : LoginScreen} icon={TabIcon} iconName="shoppingcart" hideNavBar />
                <Scene key='order' title='Order' component={this.props.loggedInUser.userName != undefined ? OrderScreen : LoginScreen} icon={TabIcon} iconName="profile" hideNavBar />
                <Scene icon={TabIcon} iconName="user" tabBarLabel='Account'>
                  <Scene key='account' title='Account' component={this.props.loggedInUser.userName != undefined ? AccountScreen : LoginScreen} hideNavBar />
                  <Scene key='profile' title='Profile' component={ProfileScreen} hideNavBar />
                </Scene>
                <Scene key='info' title='Info' component={InfoScreen} icon={TabIcon} iconName="infocirlceo" hideNavBar />
              </Scene>
              <Scene key="login" component={LoginScreen} initial={Platform.OS === 'android' && this.props.loggedInUser.userName == undefined} hideNavBar />
              <Scene key="register" component={RegisterScreen} hideNavBar />
              <Scene key="verifyemail" component={VerifyEmailScreen} hideNavBar />
              <Scene key="verifyphone" component={VerifyPhoneScreen} hideNavBar />
            </Scene>
          </Router>
        </ScrollView>
      </KeyboardAvoidingView>
    );
  }
}

class TabIcon extends Component {
  render() {
    var color = this.props.focused ? colorPalette.primaryText : colorPalette.inactive;
    return (
      <View style={{flex:1, flexDirection:'column', alignItems:'center', alignSelf:'center', justifyContent: 'center', marginTop: 10}}>
        <Icon style={{color: color}} name={this.props.iconName || "circle"} size={24}/>
      </View>
    );
  }
}

let codePushOptions = { 
  checkFrequency: __DEV__ ? codePush.CheckFrequency.MANUAL : codePush.CheckFrequency.ON_APP_RESUME, 
  installMode: codePush.InstallMode.IMMEDIATE 
}

const mapStateToProps = state => ({ loggedInUser : state.user });

export default connect(mapStateToProps, {
  updateGeneralInfo
})(codePush(codePushOptions)(App));

console.reportErrorsAsExceptions = false;