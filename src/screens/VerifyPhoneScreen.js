import React, {Component} from 'react';
import { View, Image, Alert, Text, SafeAreaView} from 'react-native';

import { connect } from 'react-redux';
import { userLogin } from '../actions/userAction';

import globalStyle from '../styles/globalStyle';
import colorPalette from '../styles/colorPalatte';

import Input from '../components/Input';
import Button from '../components/Button';

import * as API from '../api/base';
import { Actions } from 'react-native-router-flux';

class VerifyPhoneScreen extends Component {
  state = {
    OTPTimer: 0,
    isSendingOTP: false,
    isVerifying: false
  }

  doSendingOTP = () => {
    this.setState({ isSendingOTP: true });

    API.GetSendOtpSMSRequest(this.props.contactno)
    .then((response) => {
      if(response.data.sts == 0){
        if(response.data.result != true){
          Alert.alert(null, 'Failed sending OTP');
        }
        else{
          this.setState({ OTPTimer: 60 });
          this.interval = setInterval(
            () => this.setState((prevState)=> ({ OTPTimer: prevState.OTPTimer - 1 })),
            1000
          );
        }
      }
      else{
        Alert.alert(null, response.data.msg);
      }
      this.setState({ isSendingOTP: false });
    })
    .catch((error)=>{
      this.setState({ isSendingOTP: false });
      Alert.alert(null, error.message);
    });
  }

  componentDidUpdate(){
    if(this.state.OTPTimer === 0){ 
      clearInterval(this.interval);
    }
  }

  doVerification = () => {
    if(this.state.otp == null){
      Alert.alert(null, "OTP is required.");
    }
    else{
      this.setState({ isVerifying: true });

      API.GetCustomerVerifyContactRequest(this.props.contactno, this.state.otp)
      .then((response) => {
        if(response.data.sts == 0){
          Alert.alert(null, "Successfully verified. Please login.");
          Actions.reset('login');
        }
        else{
          Alert.alert(null, response.data.msg);
          this.setState({ isVerifying: false });
        }
      })
      .catch((error)=>{
        this.setState({ isVerifying: false });
        Alert.alert(null, error.message);
      });
    }
  }

  render() {
    return (
      <SafeAreaView style={[globalStyle.container, { justifyContent: 'center', alignItems: 'center' }]}>
        <View style={{alignItems: 'center'}}>
          <Text style={{color: colorPalette.defaultText, fontSize: 20}}>Please verify your contact number.</Text>
        </View>
        <View style={{ height: 150, marginTop: 60, marginBottom: 80 }}>
          <Image style={{ flex: 1, margin: 10 }} resizeMode='contain' source={{uri: this.props.generalInfo.logo}} />
        </View>
        <View style={{ height: 200, alignItems: 'center', paddingHorizontal: 30 }}>
          <Input type='text' placeholder='Contact No.' wrapperStyle={{marginBottom: 10}}
                value={this.props.contactno} disabled />
          <Input type='text' placeholder='OTP' wrapperStyle={{marginBottom: 10}}
                value={this.state.otp}
                onChangeText={(text) => this.setState({otp: text})} />
          <Button type='default' value={(!this.state.isSendingOTP ? 'SEND OTP' : "SENDING OTP...") + (this.state.OTPTimer > 0 ? (' (' + this.state.OTPTimer + ')') : "")} disabled={this.state.OTPTimer > 0 || this.state.isSendingOTP} onPress={() => this.doSendingOTP()} style={{flex: 1}} wrapperStyle={{marginBottom: 10}} />
          <Button type='primary' value={!this.state.isVerifying ? 'VERIFY' : 'VERIFYING...'} disabled={this.state.isVerifying} onPress={() => this.doVerification()} style={{flex: 1}} />
        </View>
      </SafeAreaView>
    );
  }
}

const mapStateToProps = state => ({ generalInfo : state.general.info });

export default connect(mapStateToProps, {
  userLogin
})(VerifyPhoneScreen);