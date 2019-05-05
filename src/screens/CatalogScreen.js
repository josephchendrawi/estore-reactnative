import React, {Component} from 'react';
import { View, Image, Alert, SafeAreaView } from 'react-native';

import { connect } from 'react-redux';

import globalStyle from '../styles/globalStyle';
import colorPalette from '../styles/colorPalatte';

import Input from '../components/Input';
import Button from '../components/Button';
import Header from '../components/Header';

import * as API from '../api/base';
import { Actions } from 'react-native-router-flux';
import CatalogGrid from '../components/CatalogGrid';

class CatalogScreen extends Component {
  state = {
  }

  doSearch(){
    if(this.state.searchQuery != undefined && this.state.searchQuery != '')
    {
      Actions.product({searchQuery: this.state.searchQuery});
    }
  }

  render() {
    return (
      <SafeAreaView style={[globalStyle.container]}>
        <Header title='CATALOG' hideBackBtn />
        <Input type='text' placeholder='Search for product..'
          style={{height: 50, borderRadius: 10}}
          returnKeyType="search"
          onSubmitEditing={()=> this.doSearch()}
          value={this.state.searchQuery}
          onChangeText={(text) => this.setState({searchQuery: text})} />
        <CatalogGrid />
      </SafeAreaView>
    );
  }
}

const mapStateToProps = state => ({ generalInfo : state.general.info });

export default connect(mapStateToProps, {
})(CatalogScreen);