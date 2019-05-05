import React, {Component} from 'react';
import { View, Image, Alert, SafeAreaView, ScrollView } from 'react-native';

import { connect } from 'react-redux';
import { userLogin } from '../actions/userAction';

import globalStyle from '../styles/globalStyle';
import colorPalette from '../styles/colorPalatte';

import Input from '../components/Input';
import Button from '../components/Button';

import * as API from '../api/base';
import * as CONSTANT from '../constants';
import { Actions } from 'react-native-router-flux';

class LoginScreen extends Component {
  state = {
    isLogin: true,
    isSigningIn: false,
    isSendingResetPassword: false,
    isSendingOTP: false,
    OTPTimer: 0
  }

  doLogin = () => {
    if(this.state.email == null){
      Alert.alert(null, "Email is required.");
    }
    else if(this.state.password == null){
      Alert.alert(null, "Password is required.");
    }
    else{
      this.setState({ isSigningIn: true });

      let devicetoken = "";
      API.GetCustomerLoginRequest(this.state.email, this.state.password, devicetoken)
      .then((response) => {
        if(response.data.sts == 0 || (response.data.sts == 1 && response.data.msg == CONSTANT.ADMIN_VERIFY_MSG)){
          if(this.props.generalInfo.needEmailVerify == true && response.data.isemailverify != true)
          {
            Actions.verifyemail({email: this.state.email});
          }
          else if(this.props.generalInfo.needPhoneVerify == true && response.data.isphoneverify != true)
          {
            Actions.verifyphone({contactno: this.state.email}); /////need phone num
          }
          else if(response.data.isadminverified == false){
            Alert.alert(null, CONSTANT.ADMIN_VERIFY_MSG);
          }
          else{
            this.props.userLogin(this.state.email, new Date(), response.data.accesstoken);
    
            Actions.reset('tabs');
            return;
          }
        }
        else{
          Alert.alert(null, response.data.msg);
        }
        this.setState({ isSigningIn: false });
      })
      .catch((error)=>{
        this.setState({ isSigningIn: false });
        Alert.alert(null, error.message);
      });
    }
  }

  doSendingOTP = () => {
    this.setState({ isSendingOTP: true });

    API.GetSendOtpEmailRequest(this.state.resetEmail)
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

  doResetPassword = () => {
    if(this.state.resetEmail == null){
      Alert.alert(null, "Email is required.");
    }
    else if(this.state.otp == null){
      Alert.alert(null, "OTP is required.");
    }
    else if(this.state.newPassword == null){
      Alert.alert(null, "New Password is required.");
    }
    else{
      this.setState({ isSendingResetPassword: true });

      API.GetCustomerForgotPassEmailRequest(this.state.resetEmail, this.state.otp, this.state.newPassword)
      .then((response) => {
        if(response.data.sts == 0){
          Alert.alert(null, 'Successfully reset the password');
          Actions.pop();
        }
        else{
          Alert.alert(null, response.data.msg);
        }
        this.setState({ isSendingResetPassword: false });
      })
      .catch((error)=>{
        this.setState({ isSendingResetPassword: false });
        Alert.alert(null, error.message);
      });
    }
  }

  render() {
    return (
      <SafeAreaView style={[globalStyle.container]}>
        <ScrollView bounces={false}>
          <View style={{ alignItems: 'center' }}>
            <View style={{ height: 200, marginTop: 70, marginBottom: 80 }}>
              <Image style={{ flex: 1, margin: 20, width: 180, height: 180 }} resizeMode='contain' source={{uri: this.props.generalInfo.logo}} />
            </View>
            {
              this.state.isLogin ?
              <View style={{ height: 300, alignItems: 'center', paddingHorizontal: 30 }}>
                <Input type='text' placeholder='Email' wrapperStyle={{marginBottom: 10}}
                      value={this.state.email}
                      onChangeText={(text) => this.setState({email: text})} />
                <Input type='password' placeholder='Password' wrapperStyle={{marginBottom: 10}}
                      value={this.state.password}
                      onChangeText={(text) => this.setState({password: text})} />
                <Button type='primary' value={!this.state.isSigningIn ? 'SIGN IN' : 'SIGNING IN...'} disabled={this.state.isSigningIn} onPress={() => this.doLogin()} style={{flex: 1}} wrapperStyle={{marginBottom: 10}} />
                <Button type='primary' value='REGISTER' onPress={() => Actions.register()} style={{flex: 1, marginBottom: 10}} />
                <Button type='default' value='FORGOT PASSWORD?' onPress={() => this.setState({isLogin: false})} style={{flex: 1}} />
              </View>
              :
              <View style={{ height: 300, alignItems: 'center', paddingHorizontal: 30 }}>
                <Input type='text' placeholder='Email' wrapperStyle={{marginBottom: 10}}
                      value={this.state.resetEmail}
                      onChangeText={(text) => this.setState({resetEmail: text})} />
                <Button type='default' value={(!this.state.isSendingOTP ? 'SEND OTP' : "SENDING OTP...") + (this.state.OTPTimer > 0 ? (' (' + this.state.OTPTimer + ')') : "")} disabled={this.state.OTPTimer > 0 || this.state.isSendingOTP} onPress={() => this.doSendingOTP()} style={{flex: 1}} wrapperStyle={{marginBottom: 10}} />
                <Input type='text' placeholder='OTP' wrapperStyle={{marginBottom: 10}}
                      value={this.state.otp}
                      onChangeText={(text) => this.setState({otp: text})} />
                <Input type='password' placeholder='New Password' wrapperStyle={{marginBottom: 10}}
                      value={this.state.newPassword}
                      onChangeText={(text) => this.setState({newPassword: text})} />
                <Button type='primary' value={!this.state.isSendingResetPassword ? 'RESET PASSWORD' : 'RESETING PASSWORD...'} disabled={this.state.isSendingResetPassword} style={{flex: 1}} wrapperStyle={{marginBottom: 10}} onPress={() => this.doResetPassword()} />
                <Button type='default' value='BACK' onPress={() => this.setState({isLogin: true})} style={{flex: 1}} />
              </View>
            }
          </View>
        </ScrollView>
      </SafeAreaView>
    );
  }
}

const mapStateToProps = state => ({ generalInfo: state.general.info });

export default connect(mapStateToProps, {
  userLogin
})(LoginScreen);