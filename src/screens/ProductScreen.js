import React, {Component} from 'react';
import { View, Image, Alert, SafeAreaView } from 'react-native';

import { connect } from 'react-redux';

import globalStyle from '../styles/globalStyle';
import colorPalette from '../styles/colorPalatte';

import Input from '../components/Input';
import Button from '../components/Button';
import Header from '../components/Header';
import ProductGrid from '../components/ProductGrid';

import * as API from '../api/base';
import { Actions } from 'react-native-router-flux';

class ProductScreen extends Component {
  state = {
  }

  render() {
    return (
      <SafeAreaView style={[globalStyle.container]}>
        <Header title={this.props.category != undefined ? this.props.category.name : this.props.searchQuery} />
        <ProductGrid category={this.props.category? this.props.category.id : undefined} searchQuery={this.props.searchQuery} />
      </SafeAreaView>
    );
  }
}

const mapStateToProps = state => ({ loggedInUser: state.user });

export default connect(mapStateToProps, {
})(ProductScreen);