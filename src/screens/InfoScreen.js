import React, {Component} from 'react';
import { View, Image, Text, Alert, SafeAreaView, WebView, ScrollView, Platform } from 'react-native';

import { connect } from 'react-redux';
import { userLogout } from '../actions/userAction';

import globalStyle from '../styles/globalStyle';
import colorPalette from '../styles/colorPalatte';

import Input from '../components/Input';
import Button from '../components/Button';
import Header from '../components/Header';

import * as API from '../api/base';
import { Actions } from 'react-native-router-flux';

class InfoScreen extends Component {
  state = {
  }

  render() {
    let htmlTemplate = `<!DOCTYPE html>
    <html>
    <head>
        <link href="bootstrap.min.css" rel="stylesheet" />
        <style type="text/css">
        body {
          ` + (Platform.OS == 'android' ? "" : 'font-size: 50px;') +
          `font-family: sans-serif;
        }
        p  {
          ` + (Platform.OS == 'android' ? "" : 'font-size: 50px;') +
          `font-family: sans-serif;
        }
        </style>
    </head>
    <body>XXX</body></html>`;
    
    return (
      <SafeAreaView style={[globalStyle.container]}>
        <Header title='INFORMATION' hideBackBtn />
        <ScrollView style={{flex: 1}}>
          <View style={{justifyContent: 'center', alignItems: 'center', marginTop: 20}}>
            <Image source={{uri: this.props.generalInfo.logo}} style={{width: 120, height: 120}} resizeMode="contain" />
            <Text style={{color: colorPalette.defaultText, fontSize: 26, marginTop: 14, textAlign: 'center'}}>{this.props.generalInfo.toko}</Text>
          </View>
          <View style={{flex: 1, marginHorizontal: 20, marginTop: 10, marginBottom: 20}}>
            <View style={{minHeight: 100}}>
              <WebView bounces={false} style={{backgroundColor: 'transparent'}}
                source={{html: htmlTemplate.replace("XXX", this.props.generalInfo.infos)}}
              />
            </View>
            <Text style={{color: colorPalette.inactiveText, fontSize: 14, marginTop: 14}}>Contact Us</Text>
            <View style={{minHeight: 60}}>
              <WebView bounces={false} style={{backgroundColor: 'transparent'}}
                source={{html: htmlTemplate.replace("XXX", this.props.generalInfo.kontak)}}
              />
            </View>
            <Text style={{color: colorPalette.inactiveText, fontSize: 14, marginTop: 14}}>Bank Info</Text>
            <View style={{minHeight: 60}}>
              <WebView bounces={false} style={{backgroundColor: 'transparent'}}
                source={{html: htmlTemplate.replace("XXX", this.props.generalInfo.rekening)}}
              />
            </View>
            <Text style={{color: colorPalette.inactiveText, fontSize: 14, marginTop: 14}}>FAQ</Text>
            <View style={{minHeight: 200}}>
              <WebView bounces={false} style={{backgroundColor: 'transparent'}}
                source={{html: htmlTemplate.replace("XXX", this.props.generalInfo.faq)}}
              />
            </View>
          </View>
        </ScrollView>
      </SafeAreaView>
    );
  }
}

const mapStateToProps = state => ({ loggedInUser : state.user, generalInfo : state.general.info });

export default connect(mapStateToProps, {
  userLogout
})(InfoScreen);