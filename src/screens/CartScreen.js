import React, {Component} from 'react';
import { View, Text, Alert, SafeAreaView, Modal, Platform, Dimensions, TouchableOpacity, ScrollView, ActivityIndicator, KeyboardAvoidingView } from 'react-native';

import { connect } from 'react-redux';
import { cartUpdateSelection, cartClearSelection } from '../actions/cartAction';

import Icon from 'react-native-vector-icons/Entypo';

import globalStyle from '../styles/globalStyle';
import colorPalette from '../styles/colorPalatte';

import Input from '../components/Input';
import Button from '../components/Button';
import Header from '../components/Header';

import * as API from '../api/base';
import { Actions } from 'react-native-router-flux';
import CatalogGrid from '../components/CatalogGrid';
import CartList from '../components/CartList';
import LoadingOverlay from '../components/LoadingOverlay';

const isX = Platform.OS === "ios" && (Dimensions.get("window").height > 800 || Dimensions.get("window").width > 800) ? true : false

class CartScreen extends Component {
  state = {
    itemCount: 0,
    itemTotalPrice: 0,
    modalVisible: false,
    isSettingUpDropship: false,
    isUpdatingDropship: false,
    isConfirmingOrder: false,
    showCartList: true
  }

  componentDidMount(){
    this.props.cartClearSelection();
  }

  componentDidUpdate(prevProps, prevState, snapshot) {
    if (prevProps.cartSelectedItemList !== this.props.cartSelectedItemList) {
      var newItemCount = this.props.cartSelectedItemList.reduce((sum,i)=>{
        const productQtySum = i.detail.reduce((prev,next) => prev + next.qty, 0);
        return sum + productQtySum;
      },0);
      var newItemTotalPrice = this.props.cartSelectedItemList.reduce((sum,i)=>{
        const productPriceSum = i.detail.reduce((prev,next) => prev + (next.qty * next.price), 0);
        return sum + productPriceSum;
      },0);

      this.setState({
        itemCount: newItemCount,
        itemTotalPrice: newItemTotalPrice
      })
    }
  }

  setupDropship() {
    this.setState({ isSettingUpDropship: true, isCourierLoading: true })

    API.GetCustomerProfileRequest(this.props.loggedInUser.userName, this.props.loggedInUser.accessToken)
      .then((response) => {
        if(response.data.sts == 0){
          this.setState({
            modalVisible: true,
            isSettingUpDropship: false,
            email: response.data.result.email,
            fullname: response.data.result.fullName,
            contactno: response.data.result.contact,
            address: response.data.result.address,
            countryName: "Indonesia", //response.data.result.countryName,
            provinceName: response.data.result.provinsiName,
            districtName: response.data.result.kabupatenName,
            cityName: response.data.result.cityName,
            cityid_unchanged: response.data.result.cityId,
            zipcode: response.data.result.zipcode,
          });
        }
        else{
          Alert.alert(null, response.data.msg);
        }
      })
      .catch((error)=>{
        console.warn(error);
      });

    API.GetCountryRequest()
    .then((response) => {
      if(response.data.sts == 0){
        this.setState({
          country_list : response.data.result.map((item, i) => {
              return {
                  value: item.id,
                  label: item.name
              }
          })
        });
      }
      else{
        Alert.alert(null, response.data.msg);
      }
    })
    .catch((error)=>{
      Alert.alert(null, error.message);
    });

    API.GetCourierRequest()
    .then((response) => {
      if(response.data.sts == 0){
        this.setState({
          isCourierLoading: false, 
          courier_list : response.data.result.map((item, i) => {
              return {
                  value: item.id,
                  label: item.name
              }
          })
        });
      }
      else{
        Alert.alert(null, response.data.msg);
      }
    })
    .catch((error)=>{
      Alert.alert(null, error.message);
    });
  }

  onSelectCountry = (countryid) => {
    this.setState({countryid: countryid, isProvinceLoading: true, provinceid: '', province_list: undefined, districtid: '', district_list: undefined, cityid: '', city_list: undefined});
    API.GetProvinsiRequest(countryid)
    .then((response) => {
      if(response.data.sts == 0){
        this.setState({
          isProvinceLoading: false,
          province_list : response.data.result.map((item, i) => {
              return {
                  value: item.id,
                  label: item.name
              }
          })
        });
      }
      else{
        Alert.alert(null, response.data.msg);
      }
    })
    .catch((error)=>{
      Alert.alert(null, error.message);
    });
  }

  onSelectProvince = (provinceid) => {
    this.setState({provinceid: provinceid, isDistrictLoading: true, districtid: '', district_list: undefined, cityid: '', city_list: undefined});
    API.GetKabupatenRequest(provinceid)
    .then((response) => {
      if(response.data.sts == 0){
        this.setState({
          isDistrictLoading: false,
          district_list : response.data.result.map((item, i) => {
              return {
                  value: item.id,
                  label: item.name
              }
          })
        });
      }
      else{
        Alert.alert(null, response.data.msg);
      }
    })
    .catch((error)=>{
      Alert.alert(null, error.message);
    });
  }

  onSelectDistrict = (districtid) => {
    this.setState({districtid: districtid, isCityLoading: true, cityid: '', city_list: undefined});
    API.GetCityRequest(districtid)
    .then((response) => {
      if(response.data.sts == 0){
        this.setState({
          isCityLoading: false,
          city_list : response.data.result.map((item, i) => {
              return {
                  value: item.id,
                  label: item.name
              }
          })
        });
      }
      else{
        Alert.alert(null, response.data.msg);
      }
    })
    .catch((error)=>{
      Alert.alert(null, error.message);
    });
  }

  onSelectCourier = (courierid) => {
    this.setState({courierid: courierid, isCourierPriceLoading: true, courierpriceid: '', courierprice_list: undefined});
    API.GetCourierPriceRequest(this.state.courierid, this.state.cityid == undefined ? this.state.cityid_unchanged : this.state.cityid)
    .then((response) => {
      if(response.data.sts == 0){
        this.setState({
          isCourierPriceLoading: false,
          courierprice_list : response.data.result.map((item, i) => {
              return {
                  value: item.id,
                  label: item.name + " (" + item.etd + ") Rp." + item.price.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".")
              }
          })
        });
      }
      else{
        Alert.alert(null, response.data.msg);
      }
    })
    .catch((error)=>{
      Alert.alert(null, error.message);
    });
  }

  doUpdateDropship = () => {
    if(this.props.cartSelectedItemList != undefined && this.props.cartSelectedItemList.length <= 0){
      Alert.alert(null, "Must select at least one order.");
    }
    else if(this.state.fullname == null){
      Alert.alert(null, "Full Name is required.");
    }
    else if(this.state.contactno == null){
      Alert.alert(null, "Contact No. is required.");
    }
    else if(this.state.address == null){
      Alert.alert(null, "Address is required.");
    }
    else if(this.state.zipcode == null){
      Alert.alert(null, "Zip Code is required.");
    }
    else if(this.state.courierpriceid == null){
      Alert.alert(null, "Courier is required.");
    }
    else{
      this.setState({ isUpdatingDropship: true });

      API.SetOrderDropshipRequest(this.state.fullname, this.props.cartSelectedItemList.map((val) => {return val.order_id}), this.state.cityid == undefined ? this.state.cityid_unchanged : this.state.cityid, this.state.contactno, this.state.address, this.state.zipcode, this.state.courierpriceid, this.props.loggedInUser.userName, this.props.loggedInUser.accessToken)
      .then((response) => {
        if(response.data.sts == 0){
          Alert.alert(null, "Dropship details was updated successfully.\nPlease press CONFIRM to process the order.",
          [
              {text: "CONFIRM", onPress: () => {
                this.setState({ modalVisible: false }, () => {
                  this.setState({ isConfirmingOrder: true });
                  setTimeout(() => {
                    this.doConfirmOrder();
                  }, 500);
                });
              }},
          ],
          { cancelable: false });
        }
        else{
          Alert.alert(null, response.data.msg,
            [
                {text: "OK", onPress: () => {
                  this.setState({ isUpdatingDropship: false });
                }},
            ],
            { cancelable: false });
        }
      })
      .catch((error)=>{
        Alert.alert(null, error.message,
          [
              {text: "OK", onPress: () => {
                this.setState({ isUpdatingDropship: false });
              }},
          ],
          { cancelable: false });
      });
    }
  }

  doConfirmOrder = () => {
    if(this.props.cartSelectedItemList != undefined && this.props.cartSelectedItemList.length <= 0){
      Alert.alert(null, "Must select at least one order.");
    }
    else{
      this.setState({ isConfirmingOrder: true }, () => {
        API.SetOrderConfirmRequest(this.props.cartSelectedItemList.map((val) => {return val.order_id}), this.props.loggedInUser.userName, this.props.loggedInUser.accessToken)
          .then((response) => {
            if(response.data.sts == 0){
              Alert.alert(null, "Order is successfully confirmed.",
              [
                  {text: "OK", onPress: () => {
                    this.setState({ isConfirmingOrder: false });
                    // refresh cart
                    this.props.cartClearSelection();
                    this.setState({showCartList: false}, () => {
                      this.setState({showCartList: true});
                    });
                  }},
              ],
              { cancelable: false });
            }
            else{
              Alert.alert(null, response.data.msg,
              [
                  {text: "OK", onPress: () => {
                    this.setState({ isConfirmingOrder: false });
                  }},
              ],
              { cancelable: false });
            }
          })
          .catch((error)=>{
            Alert.alert(null, error.message,
            [
                {text: "OK", onPress: () => {
                  this.setState({ isConfirmingOrder: false });
                }},
            ],
            { cancelable: false });
          });
      });
    }
  }

  render() {
    return (
      <SafeAreaView style={[globalStyle.container]}>
        <Header title='CART' hideBackBtn />
        { this.state.showCartList && <CartList />}
        <View style={[{height: 50, alignItems: 'center', justifyContent: 'space-between', backgroundColor: colorPalette.default, flexDirection: 'row', paddingHorizontal: 10, paddingVertical: 8}]}>
          <View>
            <Text style={{color: colorPalette.defaultText, fontSize: 12}}>{this.state.itemCount} item(s)</Text>
            <Text style={{color: colorPalette.defaultText, fontSize: 13}}>Rp. {this.state.itemTotalPrice.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".")}</Text>
          </View>
          <View style={{flexDirection: 'row', flex: 1, justifyContent: 'flex-end'}}>
            <Button style={{fontSize: 12}} onPress={() => {this.setupDropship();}} type='primary' value={!this.state.isSettingUpDropship ? 'DROPSHIP ' : 'SETTING UP..'} disabled={this.state.isSettingUpDropship} />
            <Button style={{fontSize: 12}} onPress={() => {this.doConfirmOrder();}} type='primary' value={!this.state.isConfirmingOrder ? 'CONFIRM ' : 'ON PROCESS...'} disabled={this.state.isConfirmingOrder} wrapperStyle={{marginLeft: 5}} />
          </View>
        </View>
        <Modal
          animationType="slide"
          transparent={true}
          onRequestClose={() => { this.setState({modalVisible: false}); }}
          visible={this.state.modalVisible}>
          <SafeAreaView style={{flex: 1, justifyContent: 'flex-end', marginBottom: isX ? 32 : 0}}>
            <TouchableOpacity style={{flex:1}}
              onPress={() => {
                this.setState({modalVisible: false});
              }}>
            </TouchableOpacity>
            <KeyboardAvoidingView behavior="padding" keyboardVerticalOffset={(Platform.OS === 'android') ? -500 : 0}>
              <TouchableOpacity activeOpacity={1}
                style={{backgroundColor: colorPalette.primary, padding: 5, alignItems: 'center', borderTopLeftRadius: 10, borderTopRightRadius: 10}}
                onPress={() => { this.setState({modalVisible: false}); }}>
                <Icon name="chevron-thin-down" size={28} style={{color: colorPalette.primaryText}} />
              </TouchableOpacity>
              {
                this.state.isSettingUpDropship ?
                  <View style={{height: 200, backgroundColor: colorPalette.background}}>
                    <ActivityIndicator color={colorPalette.loading} />
                  </View>
                :
                <ScrollView style={{backgroundColor: colorPalette.background, padding: 20, paddingTop: 10, maxHeight: 640}} bounces={false}>
                  <Input type='text' placeholder='Full Name' wrapperStyle={{marginBottom: 10}}
                        value={this.state.fullname}
                        onChangeText={(text) => this.setState({fullname: text})} />
                  <Input type='text' placeholder='Contact No.' wrapperStyle={{marginBottom: 10}}
                        value={this.state.contactno}
                        onChangeText={(text) => this.setState({contactno: text})} />
                  <Input type='text' placeholder='Address' wrapperStyle={{marginBottom: 10}}
                        value={this.state.address}
                        onChangeText={(text) => this.setState({address: text})} />
                  <Input type='dropdown' label={this.state.countryName} wrapperStyle={{marginBottom: 10}}
                        data={this.state.country_list}
                        isLoading={this.state.country_list == undefined}
                        value={this.state.countryid}
                        onChangeText={(newSelectedValue) => {this.onSelectCountry(newSelectedValue)}} />
                  <Input type='dropdown' label={this.state.provinceName} wrapperStyle={{marginBottom: 10}}
                        data={this.state.province_list}
                        isLoading={this.state.isProvinceLoading}
                        value={this.state.provinceid}
                        onChangeText={(newSelectedValue) => {this.onSelectProvince(newSelectedValue)}} />
                  <Input type='dropdown' label={this.state.districtName} wrapperStyle={{marginBottom: 10}}
                        data={this.state.district_list}
                        isLoading={this.state.isDistrictLoading}
                        value={this.state.districtid}
                        onChangeText={(newSelectedValue) => {this.onSelectDistrict(newSelectedValue)}} />
                  <Input type='dropdown' label={this.state.cityName} wrapperStyle={{marginBottom: 10}}
                        data={this.state.city_list}
                        isLoading={this.state.isCityLoading}
                        value={this.state.cityid}
                        onChangeText={(newSelectedValue) => {this.setState({cityid: newSelectedValue})}} />
                  <Input type='text' placeholder='Zip Code' wrapperStyle={{marginBottom: 10}}
                        value={this.state.zipcode}
                        onChangeText={(text) => this.setState({zipcode: text})} />
                  <Input type='dropdown' label='Courier' wrapperStyle={{marginBottom: 10}}
                        data={this.state.courier_list}
                        isLoading={this.state.isCourierLoading}
                        value={this.state.courierid}
                        onChangeText={(newSelectedValue) => {this.onSelectCourier(newSelectedValue)}} />
                  <Input type='dropdown' label='Courier Price' wrapperStyle={{marginBottom: 10}}
                        data={this.state.courierprice_list}
                        isLoading={this.state.isCourierPriceLoading}
                        value={this.state.courierpriceid}
                        onChangeText={(newSelectedValue) => {this.setState({courierpriceid: newSelectedValue})}} />
                  <Button type='primary' value={!this.state.isUpdatingDropship ? 'UPDATE' : 'UPDATING...'} disabled={this.state.isUpdatingDropship} onPress={() => this.doUpdateDropship()} style={{flex: 1, marginBottom: 10}} />
                </ScrollView>
              }
            </KeyboardAvoidingView>
          </SafeAreaView>
        </Modal>
        <Modal
          animationType="none"
          transparent={true}
          onRequestClose={() => { this.setState({isConfirmingOrder: false}); }}
          visible={this.state.isConfirmingOrder}>
          <SafeAreaView style={{flex: 1, justifyContent: 'flex-end', marginBottom: isX ? 32 : 0}}>
              <LoadingOverlay />
          </SafeAreaView>
        </Modal>
      </SafeAreaView>
    );
  }
}

const mapStateToProps = state => ({ cartSelectedItemList : state.cart.selectedItemList, loggedInUser: state.user });

export default connect(mapStateToProps, {
  cartClearSelection
})(CartScreen);