import React, {Component} from 'react';
import { View, Image, Alert, ActivityIndicator, TouchableOpacity, Text, FlatList, Modal, SafeAreaView, Platform, Dimensions, ScrollView, StyleSheet } from 'react-native';

import moment from 'moment';
import { connect } from 'react-redux';
import ImagePicker from 'react-native-image-picker';
import ImageViewer from 'react-native-image-zoom-viewer';

import Icon from 'react-native-vector-icons/Entypo';

import colorPalette from '../styles/colorPalatte';

import Input from '../components/Input';
import Button from '../components/Button';
import LoadingOverlay from '../components/LoadingOverlay';

import * as API from '../api/base';
import { Actions } from 'react-native-router-flux';

const isX = Platform.OS === "ios" && (Dimensions.get("window").height > 800 || Dimensions.get("window").width > 800) ? true : false
const defaultPageSize = 10;

class OrderList extends Component {
  state = {
    isLoading: true,
    isRefreshing: false,
    dataSource: [],
    page: 1,
    pageSize: defaultPageSize,
    selectedTab: 'NEW',
    qStatus: 'NEW',
    qFromDate: '',
    qToDate: '',
    modalVisible: false,
    isUpdatingOrderPayment: false,
    showImageViewer: false
  }

  getOrder(){
    //this.setState({isLoading: true});
    API.GetOrderRequest(0, this.state.qStatus, this.state.qFromDate, this.state.qToDate, 1, this.state.pageSize, this.props.loggedInUser.userName, this.props.loggedInUser.accessToken)
      .then((response) => {
        if(response.data.sts == 0){
          this.setState(
            {
              isLoading: false,
              isRefreshing: false,
              dataSource: response.data.result,
              totalPage: response.data.totalpage,
              page: 1
            }
          );
        }
        else{
          Alert.alert(null, response.data.msg);
        }
      })
      .catch((error)=>{
        console.warn(error);
      });
  }

  getMoreOrder(){
    if(!this.state.isLoadingMore) {
        this.setState({isLoadingMore: true}, () => {
          API.GetOrderRequest(0, this.state.qStatus, this.state.qFromDate, this.state.qToDate, this.state.page, this.state.pageSize, this.props.loggedInUser.userName, this.props.loggedInUser.accessToken)
            .then((response) => {
                if(response.data.sts == 0){
                this.setState(prevState => (
                    {
                      isLoadingMore: false,
                      dataSource: [
                        ...prevState.dataSource,
                        ...response.data.result
                      ],
                      totalPage: response.data.totalpage
                    }
                ));
                }
                else{
                  Alert.alert(null, response.data.msg);
                }
            })
            .catch((error)=>{
                console.warn(error);
            });
        });
    }
  }

  getPaymentType(){
    API.GetPaymentTypeRequest()
      .then((response) => {
        if(response.data.sts == 0){
          this.setState(
            {
              isLoading: false,
              paymentTypeList: response.data.result.map((item, i) => {
                return {
                    value: item.value,
                    label: item.name
                }
              })
            }
          );
        }
        else{
          Alert.alert(null, response.data.msg);
        }
      })
      .catch((error)=>{
        console.warn(error);
      });
  }

  PickImage(){
      this.setState({
        paymentProof: undefined,
        isChooseImageLoading: true
      });

      var options = {
        mediaType: 'photo',
        maxWidth: 600,
        maxHeight: 600,
        quality: 0.7,
        takePhotoButtonTitle: ""
      };
      
      ImagePicker.showImagePicker(options, (response) => {
        this.setState({
          isChooseImageLoading: false
        });
        if (response.didCancel) {
          //console.warn('User cancelled image picker');
        }
        else if (response.error) {
          console.warn('ImagePicker Error: ', response.error);
        }
        else {
          this.setState({
            paymentProof: response.data,
            paymentProofFileName: response.fileName,
          });
        }
      });
  }

  updateOrderPayment(){
    if(this.state.paymentTypeId == null){
      Alert.alert(null, "Payment Type is required.");
    }
    else if(this.state.paymentProof == null){// && this.state.dataSource[this.state.viewDetailsIndex].payment_proof == null){
      Alert.alert(null, "Payment Proof is required.");
    }
    else{
      this.setState({ isUpdatingOrderPayment: true });
      API.SetOrderPaymentRequest(this.state.dataSource[this.state.viewDetailsIndex].order_id, this.state.paymentTypeId, this.state.paymentProof, this.props.loggedInUser.userName, this.props.loggedInUser.accessToken)
        .then((response) => {
          if(response.data.sts == 0){
            Alert.alert(null, "Payment information is already sent. Please wait for the admin to verify it.",
            [
                {text: "OK", onPress: () => {
                  this.setState({ isUpdatingOrderPayment: false, paymentTypeId: undefined, paymentProof: undefined, paymentProofFileName: undefined }, () => {
                    this.setState({ modalVisible: false }, () => {
                      this.getOrder();
                    });
                  });
                }},
            ],
            { cancelable: false });
          }
          else{
            Alert.alert(null, response.data.msg,
              [
                  {text: "OK", onPress: () => {
                    this.setState({ isUpdatingOrderPayment: false });
                  }},
              ],
              { cancelable: false });
          }
        })
        .catch((error)=>{
          console.warn(error);
          this.setState({ isUpdatingOrderPayment: false });
        });
    }
  }

  componentDidMount(){
    this.getOrder();
    this.getPaymentType();
  }

  render() {
    let dateRangeList = [];
    for(let i=0; i<12; i++){
      let dateRange = {
        from: moment().date(1).add(1, 'months').subtract(i+1, 'months'),
        to: moment().date(1).add(1, 'months').subtract(i, 'months').subtract(1, 'days')
      };
      dateRangeList.push({
        value: dateRange.from.format('DD-MM-YYYY') + "|" + dateRange.to.format('DD-MM-YYYY'),
        label: dateRange.from.format('DD/MM/YYYY') + " - " + dateRange.to.format('DD/MM/YYYY')
      });
    }

    return (
      <View style={[{ flex: 1 }, this.props.wrapperStyle]}>
        <View style={{flexDirection: 'row', justifyContent: 'center', alignItems: 'center', backgroundColor: colorPalette.default}}>
          <TouchableOpacity onPress={() => this.setState({selectedTab: 'NEW', qStatus: 'NEW', qFromDate: '', qToDate: '', page: 1, pageSize: defaultPageSize, dateRange: ''}, () => this.getOrder())} style={{flex: 1}}>
            <Text style={[{textAlign: 'center', paddingVertical: 20, fontSize: 12}, this.state.selectedTab === 'NEW' ? styles.tabSelected : styles.tabNotSelected]}>NEW</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => this.setState({selectedTab: 'CONFIRM', qStatus: 'CONFIRM', qFromDate: '', qToDate: '', page: 1, pageSize: defaultPageSize, dateRange: ''}, () => this.getOrder())} style={{flex: 1}}>
            <Text style={[{textAlign: 'center', paddingVertical: 20, fontSize: 12}, this.state.selectedTab === 'CONFIRM' ? styles.tabSelected : styles.tabNotSelected]}>CONFIRM</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => this.setState({selectedTab: 'COMPLETE', qStatus: 'COMPLETE', qFromDate: '', qToDate: '', page: 1, pageSize: defaultPageSize, dateRange: ''}, () => this.getOrder())} style={{flex: 1}}>
            <Text style={[{textAlign: 'center', paddingVertical: 20, fontSize: 12}, this.state.selectedTab === 'COMPLETE' ? styles.tabSelected : styles.tabNotSelected]}>COMPLETE</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => this.setState({selectedTab: 'CANCEL', qStatus: 'CANCEL', qFromDate: '', qToDate: '', page: 1, pageSize: defaultPageSize, dateRange: ''}, () => this.getOrder())} style={{flex: 1}}>
            <Text style={[{textAlign: 'center', paddingVertical: 20, fontSize: 12}, this.state.selectedTab === 'CANCEL' ? styles.tabSelected : styles.tabNotSelected]}>CANCEL</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => this.setState({selectedTab: 'ALL', qStatus: '', qFromDate: '', qToDate: '', page: 1, pageSize: defaultPageSize, dateRange: ''}, () => this.getOrder())} style={{flex: 1}}>
            <Text style={[{textAlign: 'center', paddingVertical: 20, fontSize: 12}, this.state.selectedTab === 'ALL' ? styles.tabSelected : styles.tabNotSelected]}>ALL</Text>
          </TouchableOpacity>
        </View>
        <View style={{flexDirection: 'row'}}>
          <Input type='dropdown' label='From - To Date' wrapperStyle={{margin: 10, flex: 1}}
            data={dateRangeList}
            value={this.state.dateRange}
            onChangeText={(newSelectedValue) => {
              let dateRange = newSelectedValue.split('|');
              this.setState({qFromDate: dateRange[0], qToDate: dateRange[1], dateRange: undefined}, // set dateRange = undefined to reset this dropdown when tab above is pressed.
                () => {
                  this.getOrder();
                });
            }}
          />
        </View>
        {
          this.state.isLoading ?
            <ActivityIndicator color={colorPalette.loading} style={{flex: 1}} />
          :
            <View style={{marginHorizontal: 10, marginBottom: 10, flex: 1}}>
              <FlatList extraData={this.state}
                onEndReachedThreshold={0.1}
                onEndReached={() => {
                  if(this.state.page < this.state.totalPage && !this.state.isLoadingMore) {
                      this.setState(prevState => ({
                          page: prevState.page + 1,
                      }),
                      () => {
                          this.getMoreOrder();
                      });
                  }
                }}
                onRefresh={() => {
                  this.setState({isRefreshing: true});
                  this.getOrder();
                }}
                refreshing={this.state.isRefreshing}
                ListEmptyComponent={
                  <View style={{flex: 1, alignItems: 'center', justifyContent: 'center', height: 100}}>
                    <Text style={{textAlign: 'center', color: colorPalette.inactiveText}}>No data found.</Text>
                  </View>
                }
                ListHeaderComponent={
                  <View style={{flexDirection: 'row', justifyContent: 'center', alignItems: 'center', backgroundColor: colorPalette.default}}>
                    <View style={{flex: 1, height: 50, justifyContent: 'center'}}>
                      <Text style={{textAlign: 'center', color: colorPalette.defaultText}}>Date</Text>
                    </View>
                    <View style={{flex: 1, height: 50, justifyContent: 'center'}}>
                      <Text style={{textAlign: 'center', color: colorPalette.defaultText}}>Order Id</Text>
                    </View>
                    <View style={{flex: 1, height: 50, justifyContent: 'center'}}>
                      <Text style={{textAlign: 'center', color: colorPalette.defaultText}}>Status</Text>
                    </View>
                    <View style={{flex: 1, height: 50, justifyContent: 'center'}}>
                      <Text style={{textAlign: 'center', color: colorPalette.defaultText}}>Product</Text>
                    </View>
                  </View>
                }
                data={this.state.dataSource}
                keyExtractor={(item, index) => index.toString()}
                renderItem={({item, index}) => (
                  <TouchableOpacity  onPress={() => {this.setState({viewDetailsIndex: index, modalVisible: true, paymentTypeId: this.state.dataSource[index].payment_type});}} style={{flexDirection: 'row', justifyContent: 'center', alignItems: 'center'}}>
                    <View style={{flex: 1, height: 50, justifyContent: 'center'}}>
                      <Text style={{textAlign: 'left', color: colorPalette.inactiveText}}>{item.order_date}</Text>
                    </View>
                    <View style={{flex: 1, height: 50, justifyContent: 'center'}}>
                      <Text style={{textAlign: 'center', color: colorPalette.inactiveText}}>{item.order_id}</Text>
                    </View>
                    <View style={{flex: 1, height: 50, justifyContent: 'center'}}>
                      <Text style={{textAlign: 'center', color: colorPalette.inactiveText}}>{item.order_status}</Text>
                    </View>
                    <View style={{flex: 1, height: 50, justifyContent: 'center'}}>
                      <Text style={{color: colorPalette.inactiveText, textAlign: 'center'}}>{item.detail[0].product_code}</Text>
                    </View>
                  </TouchableOpacity>
                )}
              />
              {
                <Modal
                  animationType="slide"
                  transparent={true}
                  onRequestClose={() => { this.setState({modalVisible: false, viewDetailsIndex: undefined}); }}
                  visible={this.state.modalVisible}>
                  <SafeAreaView style={{flex: 1, justifyContent: 'flex-end', marginBottom: isX ? 32 : 0}}>
                    <TouchableOpacity style={{flex:1}}
                      onPress={() => {
                        this.setState({modalVisible: false, viewDetailsIndex: undefined});
                      }}>
                    </TouchableOpacity>
                    <View>
                      <TouchableOpacity activeOpacity={1}
                        style={{backgroundColor: colorPalette.primary, padding: 5, alignItems: 'center', borderTopLeftRadius: 10, borderTopRightRadius: 10}}
                        onPress={() => { this.setState({modalVisible: false, viewDetailsIndex: undefined}); }}>
                        <Icon name="chevron-thin-down" size={28} style={{color: colorPalette.primaryText}} />
                      </TouchableOpacity>
                      {
                        this.state.viewDetailsIndex != undefined &&
                        <ScrollView style={{backgroundColor: colorPalette.background, padding: 20, paddingTop: 6, maxHeight: 550}}>
                          {
                            (this.state.dataSource[this.state.viewDetailsIndex].order_status != 'NEW' && this.state.dataSource[this.state.viewDetailsIndex].order_status != 'CANCEL' && this.state.dataSource[this.state.viewDetailsIndex].payment_status == 'PENDING') &&
                            <View>
                              <View style={{marginTop: 14, flexDirection: 'row'}}>
                                <View style={{flex: 1}}>
                                  <View>
                                    <Text style={{color: colorPalette.inactiveText, fontSize: 11}}>Payment Type</Text>
                                    <Input type='dropdown' label="Payment Type"
                                      wrapperStyle={{marginTop: 10, marginRight: 10}}
                                      data={this.state.paymentTypeList}
                                      isLoading={this.state.paymentTypeList == undefined}
                                      value={this.state.paymentTypeId}
                                      onChangeText={(newSelectedValue) => {this.setState({ paymentTypeId: newSelectedValue })}} />
                                  </View>
                                  <View style={{marginTop: 14}}>
                                    <Text style={{color: colorPalette.inactiveText, fontSize: 11}}>Payment Status</Text>
                                    <Text style={{color: colorPalette.defaultText, fontSize: 14, marginTop: 4}}>{this.state.dataSource[this.state.viewDetailsIndex].payment_status}</Text>
                                  </View>
                                </View>
                                <View style={{flex: 1}}>
                                  <Text style={{color: colorPalette.inactiveText, fontSize: 11}}>Payment Proof</Text>
                                  <Button type='primary' value='Select Image' style={{flex: 1, paddingVertical: 13}}
                                    wrapperStyle={{marginTop: 10}}
                                    onPress={() => this.PickImage()} />
                                  {
                                    this.state.paymentProof == undefined ?
                                    (
                                      (this.state.dataSource[this.state.viewDetailsIndex].payment_proof != undefined && this.state.dataSource[this.state.viewDetailsIndex].payment_proof != "") &&
                                      <TouchableOpacity onPress={() => this.setState({showImageViewer: true, imageViewerURI: this.state.dataSource[this.state.viewDetailsIndex].payment_proof})}>
                                        <Image source={{uri: this.state.dataSource[this.state.viewDetailsIndex].payment_proof}} style={{ height: 100, width: 100, marginTop: 4}} />
                                      </TouchableOpacity>
                                    )
                                    :
                                    (
                                      <TouchableOpacity onPress={() => this.setState({showImageViewer: true, imageViewerURI: "data:image/png;base64," + this.state.paymentProof})}>
                                        <Image source={{uri: "data:image/png;base64," + this.state.paymentProof}} style={{ height: 100, width: 100, marginTop: 4}} />
                                        <Text style={{color: colorPalette.inactiveText, fontSize: 10}}>{this.state.paymentProofFileName}</Text>
                                      </TouchableOpacity>
                                    )
                                  }
                                </View>
                              </View>
                              <View>
                                <Button type='primary' value='SUBMIT' style={{flex: 1}}
                                      wrapperStyle={{marginVertical: 10}}
                                      onPress={() => {this.updateOrderPayment()}} />
                              </View>
                              <View style={{marginTop: 14, borderBottomColor: colorPalette.inactiveText, borderBottomWidth: 1}}></View>
                            </View>
                          }
                          <View style={{marginTop: 14, flexDirection: 'row'}}>
                            <View style={{flex: 1}}>
                              <Text style={{color: colorPalette.inactiveText, fontSize: 11}}>Order Id</Text>
                              <Text style={{color: colorPalette.defaultText, fontSize: 14, marginTop: 4}}>{this.state.dataSource[this.state.viewDetailsIndex].order_id}</Text>
                            </View>
                            <View style={{flex: 1}}>
                              <Text style={{color: colorPalette.inactiveText, fontSize: 11}}>Date</Text>
                              <Text style={{color: colorPalette.defaultText, fontSize: 14, marginTop: 4}}>{this.state.dataSource[this.state.viewDetailsIndex].order_date}</Text>
                            </View>
                          </View>
                          <View style={{marginTop: 14, flexDirection: 'row'}}>
                            <View style={{flex: 1}}>
                              <Text style={{color: colorPalette.inactiveText, fontSize: 11}}>Status</Text>
                              <Text style={{color: colorPalette.defaultText, fontSize: 14, marginTop: 4}}>{this.state.dataSource[this.state.viewDetailsIndex].order_status}</Text>
                            </View>
                            <View style={{flex: 1}}>
                              <Text style={{color: colorPalette.inactiveText, fontSize: 11}}>Admin Note</Text>
                              <Text style={{color: colorPalette.defaultText, fontSize: 14, marginTop: 4}}>{this.state.dataSource[this.state.viewDetailsIndex].remark_fromadmin}</Text>
                            </View>
                          </View>
                          <View style={{marginTop: 14, borderBottomColor: colorPalette.inactiveText, borderBottomWidth: 1}}></View>
                          <View style={{marginTop: 14, flexDirection: 'row'}}>
                            <View style={{flex: 1}}>
                              <Text style={{color: colorPalette.inactiveText, fontSize: 11}}>Full Name</Text>
                              <Text style={{color: colorPalette.defaultText, fontSize: 14, marginTop: 4}}>{this.state.dataSource[this.state.viewDetailsIndex].full_name}</Text>
                            </View>
                            <View style={{flex: 1}}>
                              <Text style={{color: colorPalette.inactiveText, fontSize: 11}}>Contact No.</Text>
                              <Text style={{color: colorPalette.defaultText, fontSize: 14, marginTop: 4}}>{this.state.dataSource[this.state.viewDetailsIndex].contact}</Text>
                            </View>
                          </View>
                          <View style={{marginTop: 14, flexDirection: 'row'}}>
                            <View style={{flex: 1}}>
                              <Text style={{color: colorPalette.inactiveText, fontSize: 11}}>Address</Text>
                              <Text style={{color: colorPalette.defaultText, fontSize: 14, marginTop: 4}}>{this.state.dataSource[this.state.viewDetailsIndex].address}</Text>
                            </View>
                          </View>
                          <View style={{marginTop: 14, flexDirection: 'row'}}>
                            <View style={{flex: 1}}>
                              <Text style={{color: colorPalette.inactiveText, fontSize: 11}}>City</Text>
                              <Text style={{color: colorPalette.defaultText, fontSize: 14, marginTop: 4}}>{this.state.dataSource[this.state.viewDetailsIndex].city_name}</Text>
                            </View>
                            <View style={{flex: 1}}>
                              <Text style={{color: colorPalette.inactiveText, fontSize: 11}}>District</Text>
                              <Text style={{color: colorPalette.defaultText, fontSize: 14, marginTop: 4}}>{this.state.dataSource[this.state.viewDetailsIndex].kabupaten_name}</Text>
                            </View>
                          </View>
                          <View style={{marginTop: 14, flexDirection: 'row'}}>
                            <View style={{flex: 1}}>
                              <Text style={{color: colorPalette.inactiveText, fontSize: 11}}>Province</Text>
                              <Text style={{color: colorPalette.defaultText, fontSize: 14, marginTop: 4}}>{this.state.dataSource[this.state.viewDetailsIndex].provinsi_name}</Text>
                            </View>
                            <View style={{flex: 1}}>
                              <Text style={{color: colorPalette.inactiveText, fontSize: 11}}>Zip Code</Text>
                              <Text style={{color: colorPalette.defaultText, fontSize: 14, marginTop: 4}}>{this.state.dataSource[this.state.viewDetailsIndex].zipcode}</Text>
                            </View>
                          </View>
                          <View style={{marginTop: 14, backgroundColor: colorPalette.default, borderRadius: 5, padding: 10, paddingTop: 0}}>
                            <FlatList extraData={this.state}
                              keyExtractor={(item, index) => index.toString()}
                              data={this.state.dataSource[this.state.viewDetailsIndex].detail}
                              renderItem={({item}) => {
                                return(
                                  <View style={{flexDirection: 'row', marginTop: 10}}>
                                    <Image source={{uri: item.product_imagethumb}} style={{ height: 60, width: 60}} />
                                    <View style={{paddingLeft: 10}}>
                                      <Text style={{color: colorPalette.defaultText, fontSize: 13}}>{item.product_name} [{item.product_code}]</Text>
                                      <Text style={{color: colorPalette.defaultText, fontSize: 12}}>{item.variant_color}</Text>
                                      <Text style={{color: colorPalette.defaultText}}>Rp. {item.price.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".")}</Text>
                                      <Text style={{color: colorPalette.defaultText}}>Qty : {item.qty}</Text>
                                    </View>
                                  </View>
                                )}
                              }
                            />
                          </View>
                          <View>
                            <View style={{marginTop: 14, flexDirection: 'row'}}>
                              <View style={{flex: 1}}>
                                <Text style={{color: colorPalette.inactiveText, fontSize: 11}}>Remarks</Text>
                                <Text style={{color: colorPalette.defaultText, fontSize: 14, marginTop: 4}}>{this.state.dataSource[this.state.viewDetailsIndex].remark_fromuser}</Text>
                              </View>
                            </View>
                            <View style={{marginTop: 14, flexDirection: 'row'}}>
                              <View style={{flex: 1}}>
                                <Text style={{color: colorPalette.inactiveText, fontSize: 11}}>Total Price</Text>
                                <Text style={{color: colorPalette.defaultText, fontSize: 14, marginTop: 4}}>{this.state.dataSource[this.state.viewDetailsIndex].total_price.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".")}</Text>
                              </View>
                              <View style={{flex: 1}}>
                                <Text style={{color: colorPalette.inactiveText, fontSize: 11}}>Shipping Fee</Text>
                                <Text style={{color: colorPalette.defaultText, fontSize: 14, marginTop: 4}}>{this.state.dataSource[this.state.viewDetailsIndex].shipping_fee}</Text>
                              </View>
                            </View>
                            {
                              (this.state.dataSource[this.state.viewDetailsIndex].order_status == 'CANCEL' || this.state.dataSource[this.state.viewDetailsIndex].payment_status != 'PENDING') &&
                              <View>
                                <View style={{marginTop: 14, borderBottomColor: colorPalette.inactiveText, borderBottomWidth: 1}}></View>
                                <View style={{marginTop: 14, flexDirection: 'row'}}>
                                  <View style={{flex: 1}}>
                                    <Text style={{color: colorPalette.inactiveText, fontSize: 11}}>Payment Type</Text>
                                    <Text style={{color: colorPalette.defaultText, fontSize: 14, marginTop: 4}}>{this.state.dataSource[this.state.viewDetailsIndex].payment_type}</Text>
                                  </View>
                                  <View style={{flex: 1}}>
                                    <Text style={{color: colorPalette.inactiveText, fontSize: 11}}>Payment Proof</Text>
                                    {
                                      (this.state.dataSource[this.state.viewDetailsIndex].payment_proof != undefined && this.state.dataSource[this.state.viewDetailsIndex].payment_proof != "") &&
                                      <TouchableOpacity onPress={() => this.setState({showImageViewer: true, imageViewerURI: this.state.dataSource[this.state.viewDetailsIndex].payment_proof})}>
                                        <Image source={{uri: this.state.dataSource[this.state.viewDetailsIndex].payment_proof}} style={{ height: 100, width: 100, marginTop: 4}} />
                                      </TouchableOpacity>
                                    }
                                  </View>
                                </View>
                                <View style={{marginTop: 14, flexDirection: 'row'}}>
                                  <View style={{flex: 1}}>
                                    <Text style={{color: colorPalette.inactiveText, fontSize: 11}}>Payment Status</Text>
                                    <Text style={{color: colorPalette.defaultText, fontSize: 14, marginTop: 4}}>{this.state.dataSource[this.state.viewDetailsIndex].payment_status}</Text>
                                  </View>
                                  <View style={{flex: 1}}>
                                    <Text style={{color: colorPalette.inactiveText, fontSize: 11}}>Payment Date</Text>
                                    <Text style={{color: colorPalette.defaultText, fontSize: 14, marginTop: 4}}>{this.state.dataSource[this.state.viewDetailsIndex].payment_date}</Text>
                                  </View>
                                </View>
                              </View>
                            }
                          </View>
                          <View style={{height: 24}}></View>
                        </ScrollView>
                      }
                      <Modal
                        animationType="none"
                        transparent={true}
                        onRequestClose={() => { this.setState({isUpdatingOrderPayment: false}); }}
                        visible={this.state.isUpdatingOrderPayment}>
                        <SafeAreaView style={{flex: 1, justifyContent: 'flex-end', marginBottom: isX ? 32 : 0}}>
                            <LoadingOverlay />
                        </SafeAreaView>
                      </Modal>
                      <Modal
                        animationType="none"
                        transparent={true}
                        onRequestClose={() => { this.setState({showImageViewer: false}); }}
                        visible={this.state.showImageViewer}>
                        <SafeAreaView style={{flex: 1, justifyContent: 'flex-end', marginBottom: isX ? 32 : 0}}>
                          <View style={{alignItems: 'flex-end', backgroundColor: 'black'}}>
                            <TouchableOpacity onPress={() => this.setState({showImageViewer: false})}>
                              <Icon name="cross" size={40} style={{color: 'white'}} />
                            </TouchableOpacity>
                          </View>
                          <View style={{flex: 1}}>
                            {
                              this.state.imageViewerURI &&
                              <ImageViewer imageUrls={[
                                {
                                  url: this.state.imageViewerURI,
                                }
                              ]}
                              renderIndicator={(currentIndex, allSize) => {}}
                              />
                            }
                          </View>
                        </SafeAreaView>
                      </Modal>
                    </View>
                  </SafeAreaView>
                </Modal>
              }
            </View>
        }
      </View>
    );
  }
}

const styles = StyleSheet.create({
  tabNotSelected: {
      backgroundColor: colorPalette.default,
      color: colorPalette.defaultText
  },
  tabSelected: {
      backgroundColor: colorPalette.primary,
      color: colorPalette.primaryText
  },
});

const mapStateToProps = state => ({ loggedInUser: state.user });

export default connect(mapStateToProps, {
})(OrderList);