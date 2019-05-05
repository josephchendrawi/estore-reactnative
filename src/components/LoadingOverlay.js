import React, { Component } from 'react';
import {
  ActivityIndicator,
  View,
} from 'react-native';

import colorPalette from '../styles/colorPalatte';

export default class LoadingOverlay extends Component {
  render() {
    return (
        <View style={[{
            flex: 1,
            zIndex : 9,
            position: 'absolute',
            left: 0,
            right: 0,
            top: 0,
            bottom: 0,
            opacity: 0.5,
            backgroundColor: 'black'}, this.props.style]}>
            <ActivityIndicator style={{flex: 1}} size="large" color={colorPalette.default} />
        </View>
    );
  }
}