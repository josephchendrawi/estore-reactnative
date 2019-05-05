import React, {Component} from 'react';
import { View, Image, Alert, SafeAreaView } from 'react-native';

import { connect } from 'react-redux';

import globalStyle from '../styles/globalStyle';
import colorPalette from '../styles/colorPalatte';

import Input from '../components/Input';
import Button from '../components/Button';
import Header from '../components/Header';
import OrderList from '../components/OrderList';

import * as API from '../api/base';
import { Actions } from 'react-native-router-flux';
import CatalogGrid from '../components/CatalogGrid';

class OrderScreen extends Component {
  state = {
  }

  render() {
    return (
      <SafeAreaView style={[globalStyle.container]}>
        <Header title='ORDER' hideBackBtn />
        <OrderList />
      </SafeAreaView>
    );
  }
}

const mapStateToProps = state => ({ generalInfo : state.general.info });

export default connect(mapStateToProps, {
})(OrderScreen);