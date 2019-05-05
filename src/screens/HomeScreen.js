import React, {Component} from 'react';
import { View, Image, Alert, SafeAreaView, TouchableOpacity, Text, StyleSheet, Platform, ScrollView } from 'react-native';

import { connect } from 'react-redux';
import firebase from 'react-native-firebase';

import { updateFcmToken } from '../actions/generalAction';
import { updateFcmTokenSentFlag } from '../actions/userAction';

import globalStyle from '../styles/globalStyle';
import colorPalette from '../styles/colorPalatte';

import Input from '../components/Input';
import Button from '../components/Button';
import Banner from '../components/Banner';
import ProductGrid from '../components/ProductGrid';
import HomeHeader from '../components/HomeHeader';

import * as API from '../api/base';
import { Actions } from 'react-native-router-flux';

class HomeScreen extends Component {
  state = {
    productGridTypeId: '0'
  }

  componentDidMount(){
    if(this.props.loggedInUser.userName != undefined){
      this.checkFcmPermission();
    }

    this.notificationListener = firebase.notifications().onNotification((notification) => {
      // console.warn("OnNotification");
      // console.warn(notification.data);
      // console.warn(notification.body);
      // console.warn(notification.title);
      
      // Foreground notification for Android
      if(Platform.OS === 'android') {
        const newNotification = new firebase.notifications.Notification()
              .setNotificationId(notification.notificationId)
              .android.setChannelId(notification.data.channelId)
              .android.setSmallIcon("@mipmap/ic_notification")
              .setTitle(notification.title)
              .setBody(notification.body)
              .setSound("default")
              .setData(notification.data)
              .android.setAutoCancel(true)

        // Build a channel
        const channel = new firebase.notifications.Android.Channel(notification.data.channelId, notification.data.channelName, firebase.notifications.Android.Importance.Max);

        // Create the channel
        firebase.notifications().android.createChannel(channel);
        firebase.notifications().displayNotification(newNotification);
      }
      else{
        firebase.notifications().displayNotification(notification);
      }
    });
  }

  componentWillUnmount() {
    this.notificationListener();
  }

  async checkFcmPermission() {
    const enabled = await firebase.messaging().hasPermission();
    if (enabled) {
      this.getFcmToken();
    } else {
        this.requestFcmPermission();
    }
  }

  async getFcmToken() {
    let fcmToken = this.props.fcmToken;
    if (fcmToken == undefined) {
      fcmToken = await firebase.messaging().getToken();
      if (fcmToken) {
          // user has a device token
          //console.warn(fcmToken);

          this.sendFcmToken(fcmToken);
      }
    }
    else if(!this.props.loggedInUser.isFcmTokenSent){
      this.sendFcmToken(fcmToken);
    }
  }

  async requestFcmPermission() {
    try {
        await firebase.messaging().requestPermission();
        // User has authorised
        this.getFcmToken();
    } catch (error) {
        // User has rejected permissions
        console.log('permission rejected');
    }
  }

  async sendFcmToken(fcmToken) {
    API.SetCustomerFcmToken(fcmToken, this.props.loggedInUser.userName, this.props.loggedInUser.accessToken)
      .then((response) => {
        if(response.data.sts == 0){
          this.props.updateFcmToken(fcmToken);
          this.props.updateFcmTokenSentFlag(true);
        }
        else{
          console.warn(response.data.msg);
        }
      })
      .catch((error)=>{
        console.warn(error.message);
      });
  }

  render() {
    return (
      <SafeAreaView style={[globalStyle.container]}>
        <HomeHeader />
        <Banner />
        <View style={{flexDirection: 'row', justifyContent: 'center', alignItems: 'center', backgroundColor: colorPalette.default}}>
          <TouchableOpacity onPress={() => this.setState({productGridTypeId: '0'})} style={{flex: 1}}>
            <Text style={[{textAlign: 'center', paddingVertical: 20, fontSize: 12}, this.state.productGridTypeId === '0' ? styles.tabSelected : styles.tabNotSelected]}>ALL PRODUCTS</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => this.setState({productGridTypeId: '1'})} style={{flex: 1}}>
            <Text style={[{textAlign: 'center', paddingVertical: 20, fontSize: 12}, this.state.productGridTypeId === '1' ? styles.tabSelected : styles.tabNotSelected]}>BEST SELLER</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => this.setState({productGridTypeId: '2'})} style={{flex: 1}}>
            <Text style={[{textAlign: 'center', paddingVertical: 20, fontSize: 12}, this.state.productGridTypeId === '2' ? styles.tabSelected : styles.tabNotSelected]}>PROMOTION</Text>
          </TouchableOpacity>
        </View>
        <ProductGrid type={this.state.productGridTypeId} />
      </SafeAreaView>
    );
  }
}

const styles = StyleSheet.create({
  tabNotSelected: {
      backgroundColor: colorPalette.default,
      color: colorPalette.defaultText
  },
  tabSelected: {
      backgroundColor: colorPalette.primary,
      color: colorPalette.primaryText
  },
});

const mapStateToProps = state => ({ generalInfo: state.general.info, fcmToken: state.general.fcmToken, loggedInUser: state.user });

export default connect(mapStateToProps, {
  updateFcmToken, updateFcmTokenSentFlag
})(HomeScreen);