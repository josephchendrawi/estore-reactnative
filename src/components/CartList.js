import React, {Component} from 'react';
import { View, Image, Alert, ActivityIndicator, TouchableOpacity, Text, FlatList } from 'react-native';

import { connect } from 'react-redux';
import { cartUpdateSelection, cartClearSelection } from '../actions/cartAction';
import moment from 'moment';

import colorPalette from '../styles/colorPalatte';

import Input from '../components/Input';
import Button from '../components/Button';

import * as API from '../api/base';
import { Actions } from 'react-native-router-flux';
import { withNavigationFocus } from 'react-navigation';

class CartList extends Component {
  state = {
    isLoading: true,
    isRefreshing: false,
    dataSource: [],
  }

  getCartItems(){
    API.GetOrderNewRequest(this.props.loggedInUser.userName, this.props.loggedInUser.accessToken)
      .then((response) => {
        if(response.data.sts == 0){
          this.setState({
            isLoading: false,
            isRefreshing: false,
            dataSource: response.data.result.map(value => {
              return {
                ...value,
                id: value.order_id,
              }
            })
          });
        }
        else{
          Alert.alert(null, response.data.msg);
        }
      })
      .catch((error)=>{
        console.warn(error);
      });
  }

  componentDidMount(){
    this.getCartItems();
  }

  componentDidUpdate(prevProps, prevState, snapshot) {
    if(prevProps.isFocused === false && this.props.isFocused === true){
      this.setState({isLoading: true});
      this.getCartItems();
    }
  }

  toggleItemSelection(itemId){
    let newDataSource = this.state.dataSource.map(dt => {
      if(dt.id === itemId)
      {
        dt.selected = !dt.selected;
        this.props.cartUpdateSelection(dt, dt.selected);
      }

      return dt;
    })
    this.setState({ dataSource : newDataSource });
  }

  render() {
    return (
      this.state.isLoading ?
        <ActivityIndicator color={colorPalette.loading} style={{flex: 1}} />
      :
        <View style={[{ flex: 1 }, this.props.wrapperStyle]}>
          <FlatList extraData={this.state}
            onRefresh={() => {
              this.setState({isRefreshing: true});
              this.getCartItems();
            }}
            refreshing={this.state.isRefreshing}
            ListEmptyComponent={
              <View style={{flex: 1, alignItems: 'center', justifyContent: 'center', height: 200}}>
                <Text style={{textAlign: 'center', color: colorPalette.inactiveText}}>No data found.</Text>
              </View>
            }
            keyExtractor={(item, index) => index.toString()}
            data={this.state.dataSource}
            renderItem={({item,index}) => {
              return(
              <View style={{flexDirection: 'row', alignItems: 'center', marginHorizontal: 20, marginVertical: 10}}>
                <Input type="checkbox" size={24} checked={item.selected} onChangeValue={(newValue) => {this.toggleItemSelection(item.id)}} wrapperStyle={{marginRight: 20}} />
                <TouchableOpacity onPress={() => this.toggleItemSelection(item.id)} style={{backgroundColor: colorPalette.default, flex: 1, borderRadius: 5, padding: 10, paddingTop: 0}}>
                  <Text style={{color: colorPalette.inactiveText, textAlign: 'right', fontSize: 13, paddingTop: 5}}>Expires at {moment(item.expire_date, "DD-MM-YYYY HH:mm:ss").format('DD MMM YYYY, HH:mm')}</Text>
                  <FlatList extraData={this.state}
                    keyExtractor={(item, index) => index.toString()}
                    data={this.state.dataSource[index].detail}
                    renderItem={({item}) => {
                      return(
                        <View style={{flexDirection: 'row', marginTop: 10}}>
                          <Image source={{uri: item.product_imagethumb}} style={{ height: 60, width: 60}} />
                          <View style={{paddingLeft: 10}}>
                            <Text numberOfLines={1} style={{color: colorPalette.defaultText, fontSize: 13, maxWidth: 160}}>{item.product_name} [{item.product_code}]</Text>
                            <Text style={{color: colorPalette.defaultText, fontSize: 12}}>{item.variant_color}</Text>
                            <Text style={{color: colorPalette.defaultText}}>Rp. {item.price.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".")}</Text>
                            <Text style={{color: colorPalette.defaultText}}>Qty : {item.qty}</Text>
                          </View>
                        </View>
                      )}
                    }
                  />
                  <View style={{marginTop: 7}}>
                    <Text style={{color: colorPalette.inactiveText, fontSize: 12}}>Remarks</Text>
                    <Text style={{color: colorPalette.defaultText}}>{item.remark_fromuser}</Text>
                  </View>
                </TouchableOpacity>
              </View>
            )}}
          />
        </View>
    );
  }
}

const mapStateToProps = state => ({ cartSelectedItemList : state.cart.selectedItemList, loggedInUser: state.user });

export default withNavigationFocus(connect(mapStateToProps, {
  cartUpdateSelection, cartClearSelection
})(CartList));