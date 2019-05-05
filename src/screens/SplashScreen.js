import React, {Component} from 'react';
import { View, Image, Alert, SafeAreaView, ActivityIndicator } from 'react-native';

import { connect } from 'react-redux';

import globalStyle from '../styles/globalStyle';
import colorPalette from '../styles/colorPalatte';

import Input from '../components/Input';
import Button from '../components/Button';
import Header from '../components/Header';

import * as API from '../api/base';
import { Actions } from 'react-native-router-flux';

class SplashScreen extends Component {
  state = {
  }

  render() {
    let logo = <ActivityIndicator size="large" />;
    if(this.props.general != undefined && this.props.general.info != undefined){
      logo = <Image style={{ flex: 1, width: 120, height: 120 }} resizeMode='contain' source={{uri: this.props.general.info.logo}} />
    }
    return (
      <SafeAreaView style={[globalStyle.container, { justifyContent: 'center', alignItems: 'center' }]}>
        <View style={{ height: 120 }}>
          {logo}
        </View>
      </SafeAreaView>
    );
  }
}

const mapStateToProps = state => ({ general : state.general });

export default connect(mapStateToProps, {
})(SplashScreen);