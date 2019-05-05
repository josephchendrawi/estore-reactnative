import React, {Component} from 'react';
import { View, Image, Text, Alert, SafeAreaView } from 'react-native';

import { connect } from 'react-redux';
import { userLogout } from '../actions/userAction';

import globalStyle from '../styles/globalStyle';
import colorPalette from '../styles/colorPalatte';

import Input from '../components/Input';
import Button from '../components/Button';
import Header from '../components/Header';

import * as API from '../api/base';
import { Actions } from 'react-native-router-flux';

class AccountScreen extends Component {
  state = {
  }

  render() {
    return (
      <SafeAreaView style={[globalStyle.container]}>
        <Header title='ACCOUNT' hideBackBtn />
        <View style={{flexDirection: 'row', marginTop: 20}}>
          <View style={{borderRadius: 50, marginHorizontal: 20}}>
            <Image source={require('../assets/user.png')} style={{width: 100, height: 100, tintColor: colorPalette.primary}} />
          </View>
          <View style={{flex: 1, alignItems: 'flex-start'}}>
            <Text style={{color: colorPalette.inactiveText, fontSize: 20, marginTop: 10}}>{this.props.loggedInUser.userName}</Text>
            <Button onPress={() => Actions.profile()} type='primary' value="EDIT PROFILE" wrapperStyle={{marginTop: 10}} />
          </View>
        </View>
        <View style={{alignItems: 'center', marginTop: 30}}>
          {/* <Button type='primary' value="SETTINGS" onPress={() => {}} wrapperStyle={{marginTop: 10, marginHorizontal: 20}} style={{flex: 1}} /> */}
          <Button type='primary' value="LOGOUT" onPress={() => this.props.userLogout()} wrapperStyle={{marginTop: 10, marginHorizontal: 20}} style={{flex: 1}} />
        </View>
      </SafeAreaView>
    );
  }
}

const mapStateToProps = state => ({ loggedInUser : state.user });

export default connect(mapStateToProps, {
  userLogout
})(AccountScreen);