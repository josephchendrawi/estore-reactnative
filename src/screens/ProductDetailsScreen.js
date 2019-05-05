import React, {Component} from 'react';
import { View, Image, Alert, TouchableOpacity, SafeAreaView, Text, ScrollView, FlatList, ActivityIndicator, Modal, Dimensions, Platform, CameraRoll, PermissionsAndroid, Clipboard, KeyboardAvoidingView } from 'react-native';

import { connect } from 'react-redux';

import Icon from 'react-native-vector-icons/Entypo';
import RNFetchBlob from 'rn-fetch-blob';
import Share from 'react-native-share';

import globalStyle from '../styles/globalStyle';
import colorPalette from '../styles/colorPalatte';

import Input from '../components/Input';
import Button from '../components/Button';
import ProductGallery from '../components/ProductGallery';
import LoadingOverlay from '../components/LoadingOverlay';

import * as API from '../api/base';
import { Actions } from 'react-native-router-flux';

const isX = Platform.OS === "ios" && (Dimensions.get("window").height > 800 || Dimensions.get("window").width > 800) ? true : false

class ProductDetailsScreen extends Component {
  state = {
    isLoading: true,
    isSavingImage: false,
    isSharing: false,
    isAddingToCart: false,
    modalVisible: false,
    descriptionModalVisible: false,
  }

  componentDidMount(){
    this.getProductDetails();
    this.setState({
      fullDescription : this.props.product.description
    });
  }

  getProductDetails(){
    API.GetProductDetailRequest(this.props.product.id, this.props.loggedInUser.userName)
      .then((response) => {
        if(response.data.sts == 0){
          this.setState(
            {
              isLoading: false,
              variant: response.data.variant,
              image : response.data.image
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

  saveToCameraRoll = async (image_url) => {
    if (Platform.OS === 'android') {
      const granted = await PermissionsAndroid.request(
        PermissionsAndroid.PERMISSIONS.WRITE_EXTERNAL_STORAGE
      );
      if(granted === PermissionsAndroid.RESULTS.GRANTED){
        await RNFetchBlob.config({fileCache: true, appendExt : 'jpg'})
        .fetch("GET", image_url)
        .then((res) => {
          CameraRoll.saveToCameraRoll(res.path())
        })
        .catch((err) => {})
      }
    } else {
        CameraRoll.saveToCameraRoll(image_url)
    }
  }

  saveAllToCameraRoll = async () => {
    this.setState({isSavingImage: true});
    for (let image of this.state.image) {   
        await this.saveToCameraRoll(image.imageOri); 
    }
    this.setState({isSavingImage: false});
    Alert.alert(null, "All of the images have been saved.");
  }

  shareAllImages = async () => {
    this.setState({isSharing: true});
    let base64List = [];
    for (let image of this.state.image) {
      await RNFetchBlob
        .fetch("GET", image.imageOri)
        .then((res) => {
          let base64string = res.base64();
          if(base64string != null)
            base64List.push('data:image/png;base64,' + base64string);
        })
        .catch((err) => {})
    }

    await Share.open({
      urls: base64List,
      type: 'image/jpg',
    })
    .catch((err) => { /*err && console.log(err);*/ });

    this.setState({isSharing: false});
  }

  addToCart = () => {
    let orderDetail = [];
    let totalQty = 0;
    
    for(i=0;i<this.state.variant.length;i++)
    {
      if(this.state['variant-' + this.state.variant[i].id] != undefined && this.state['variant-' + this.state.variant[i].id] != 0)
      {
        orderDetail.push({
          variant_id: this.state.variant[i].id,
          qty: parseInt(this.state['variant-' + this.state.variant[i].id])
        });

        totalQty += parseInt(this.state['variant-' + this.state.variant[i].id]);
      }
    }

    if(totalQty <= 0){
      Alert.alert(null, "You haven't input the quantity yet");
    }
    else{
      this.setState({
        isAddingToCart: true
      },
      () => {
        API.SetOrderRequest(orderDetail, this.state.remarks, this.props.loggedInUser.userName, this.props.loggedInUser.accessToken)
          .then((response) => {
            if(response.data.sts == 0){
              Alert.alert(null, "Successfully added to cart",
              [
                  {text: "OK", onPress: () => {
                    this.setState(
                      {
                        isAddingToCart: false,
                      },
                      () => {
                        this.setState({
                          modalVisible: false
                        },
                        () => {
                          Actions.pop();
                          Actions.cart();
                        });
                      }
                    );
                  }},
              ],
              { cancelable: false });
            }
            else{
              this.setState(
                {
                  isAddingToCart: false,
                },
                () => {
                  Alert.alert(null, response.data.msg);
                }
              );
            }
          })
          .catch((error)=>{
            console.warn(error);
            this.setState(
              {
                isAddingToCart: false,
              }
            );
          });
      })
    }
  }

  render() {
    return (
      <SafeAreaView style={[globalStyle.container]}>
        {
          this.state.isLoading ?
            <ActivityIndicator color={colorPalette.loading} style={{flex: 1}} />
          :
            <View style={{flex: 1}}>
              <View style={{height: 350}}>
                <ProductGallery height={350} imageList={this.state.image.map((obj) => obj.imageThumb)} largeImageList={this.state.image.map((obj) => obj.imageOri)} enableImageViewer />
                <View style={{flexDirection: 'row', flex: 1, position: 'absolute', width: Dimensions.get("window").width, justifyContent: 'space-between', alignItems: 'center', marginTop: 6}}>
                  <TouchableOpacity style={{width: 32}} onPress={() => Actions.pop()}>
                    <Icon style={{color: colorPalette.primaryText, alignSelf: 'center'}} name='chevron-left' size={36}/>
                  </TouchableOpacity>
                  <Button type='default' value={<Icon name={this.state.isSavingImage ? 'hour-glass' : 'download'} size={24} />} disabled={this.state.isSavingImage} onPress={() => {this.saveAllToCameraRoll()}} style={{justifyContent: 'center', alignItems: 'center', borderRadius: 4, paddingHorizontal:10, paddingVertical: 5}} wrapperStyle={{marginRight: 6}} />
                </View>
              </View>
              <View style={{flexDirection: 'row', paddingTop: 10, paddingHorizontal: 20}}>
                <View style={{flex: 1}}>
                  <Text selectable style={{color: colorPalette.defaultText, fontSize: 20}}>{this.props.product.name} [{this.props.product.code}]</Text>
                  { this.props.loggedInUser.userName != undefined && <Text selectable style={{color: colorPalette.primary, fontSize: 24, marginTop: 5}}>Rp. {this.props.product.price.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".")}</Text> }
                </View>
                <View style={{flexDirection: 'row', alignItems: 'flex-start', justifyContent: 'flex-end'}}>
                  <Button type='primary' value={<Icon name='chat' size={24} />} onPress={() => {Actions.chat({chatWithProduct: this.props.product})}} style={{justifyContent: 'center', alignItems: 'center', borderRadius: 4, paddingHorizontal:10, paddingVertical: 5}} wrapperStyle={{}} />
                  <Button type='default' value={<Icon name={this.state.isSharing ? 'hour-glass' : 'share'} size={24} />} disabled={this.state.isSharing} onPress={() => {this.shareAllImages()}} style={{justifyContent: 'center', alignItems: 'center', borderRadius: 4, paddingHorizontal:10, paddingVertical: 5}} wrapperStyle={{marginLeft: 10}} />
                </View>
              </View>
              <View style={{flexDirection: 'row', justifyContent: 'space-between'}}>
                <Text style={{color: colorPalette.placeholderText, fontSize: 13, marginTop: 10, paddingHorizontal: 20}}>Description</Text>
                <TouchableOpacity onPress={async ()=> {await Clipboard.setString(this.state.fullDescription); Alert.alert(null,'Copied to clipboard');}}><Text style={{color: colorPalette.primary, fontSize: 14, marginTop: 10, paddingHorizontal: 20}}>Copy</Text></TouchableOpacity>
              </View>
              <TouchableOpacity style={{flex: 1}} onPress={() => { this.setState({descriptionModalVisible: true})}}>
                <ScrollView style={{flex: 1, backgroundColor: colorPalette.default, paddingHorizontal: 10, paddingVertical: 5, marginHorizontal: 20, marginBottom: 20, marginTop: 5, borderRadius: 5}}>
                  <Text selectable style={{color: colorPalette.defaultText, fontSize: 14, lineHeight: 28, paddingBottom: 10}}>
                    { this.state.fullDescription }
                  </Text>
                </ScrollView>
              </TouchableOpacity>
              {
                this.props.loggedInUser.userName != undefined &&
                <View style={{flexDirection: 'row'}}>
                  <Button type='primary' value='ORDER' onPress={() => {this.setState({modalVisible: true});}} style={{flex: 1, paddingVertical: 15}} wrapperStyle={{flex: 4}} />
                </View>
              }
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

                    <ScrollView style={{backgroundColor: colorPalette.background}} bounces={false}>
                      <FlatList extraData={this.state} bounces={false}
                        style={{maxHeight: 340}}
                        data={this.state.variant}
                        keyExtractor={(item, index) => index.toString()}
                        ListHeaderComponent={
                          <View style={{flexDirection: 'row', justifyContent: 'center', alignItems: 'center'}}>
                            <View style={{flex: 1, justifyContent: 'center'}}>
                              <Text style={{textAlign: 'center', paddingVertical: 14, color: colorPalette.defaultText, fontSize: 14}}>Variant</Text>
                            </View>
                            <View style={{flex: 1, justifyContent: 'center'}}>
                              <Text style={{textAlign: 'center', paddingVertical: 14, color: colorPalette.defaultText, fontSize: 14}}>Price</Text>
                            </View>
                            <View style={{flex: 1, justifyContent: 'center', backgroundColor: colorPalette.default}}>
                              <Text style={{textAlign: 'center', paddingVertical: 14, color: colorPalette.defaultText, fontSize: 14}}>Quantity</Text>
                            </View>
                          </View>
                        }
                        renderItem={({item}) => (
                          <View style={{flexDirection: 'row', justifyContent: 'center', alignItems: 'center'}}>
                            <View style={{flex: 1, justifyContent: 'center', height: 100}}>
                              <Text style={{textAlign: 'center', color: colorPalette.inactiveText, fontSize: 14}}>{item.color}</Text>
                              {
                                item.isLimited &&
                                <Text style={{textAlign: 'center', color: colorPalette.danger, fontSize: 12, marginTop: 5}}>(Limited stock)</Text>
                              }
                            </View>
                            <View style={{flex: 1, justifyContent: 'center', height: 100}}>
                              <Text style={{textAlign: 'center', color: colorPalette.inactiveText, fontSize: 14}}>Rp. {item.price.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".")}</Text>
                            </View>
                            <View style={{flex: 1, justifyContent: 'center', height: 100, backgroundColor: colorPalette.default}}> 
                              <Input type='text' placeholder={item.qty <= 0 ? 'Sold out' : '0'} wrapperStyle={{padding: 14, backgroundColor: 'transparent'}} style={{textAlign: 'center', fontSize: 14}}
                                    disabled={item.qty <= 0}
                                    value={this.state['variant-' + item.id]}
                                    onChangeText={(text) => this.setState({['variant-' + item.id]: text})} />
                            </View>
                          </View>
                        )}
                      />
                      <Input type='text' multiline placeholder='Remarks' wrapperStyle={{margin: 20, paddingVertical: 10, paddingHorizontal: 5}} style={{minHeight: 60, textAlignVertical: 'top'}}
                        value={this.state.remarks}
                        onChangeText={(text) => this.setState({remarks: text})} />
                      <Button type='primary' value={!this.state.isAddingToCart ? 'ADD TO CART' : 'PROCESSING...'} disabled={this.state.isAddingToCart} onPress={() => {this.addToCart();}} style={{flex: 1, paddingVertical: 15}} />
                    </ScrollView>
                  </KeyboardAvoidingView>
                  { this.state.isAddingToCart && <LoadingOverlay style={{position: 'absolute', top: 0, left: 0}} /> }
                </SafeAreaView>
              </Modal>
              <Modal
                animationType="slide"
                transparent={true}
                onRequestClose={() => { this.setState({descriptionModalVisible: false}); }}
                visible={this.state.descriptionModalVisible}>
                <SafeAreaView style={{flex: 1, justifyContent: 'flex-end', marginBottom: isX ? 32 : 0}}>
                  <TouchableOpacity style={{flex:1}}
                    onPress={() => {
                      this.setState({descriptionModalVisible: false});
                    }}>
                  </TouchableOpacity>
                  <KeyboardAvoidingView behavior="padding" keyboardVerticalOffset={(Platform.OS === 'android') ? -500 : 0}>
                    <TouchableOpacity activeOpacity={1}
                      style={{backgroundColor: colorPalette.primary, padding: 5, alignItems: 'center', borderTopLeftRadius: 10, borderTopRightRadius: 10}}
                      onPress={() => { this.setState({descriptionModalVisible: false}); }}>
                      <Icon name="chevron-thin-down" size={28} style={{color: colorPalette.primaryText}} />
                    </TouchableOpacity>

                    <View style={{ backgroundColor: colorPalette.background, minHeight: 400}}>
                      <View style={{flexDirection: 'row', justifyContent: 'space-between'}}>
                        <Text style={{color: colorPalette.placeholderText, fontSize: 13, marginTop: 10, paddingHorizontal: 20}}>Description</Text>
                        <TouchableOpacity onPress={async ()=> {await Clipboard.setString(this.state.fullDescription); Alert.alert(null,'Copied to clipboard');}}><Text style={{color: colorPalette.primary, fontSize: 14, marginTop: 10, paddingHorizontal: 20}}>Copy</Text></TouchableOpacity>
                      </View>
                      <ScrollView style={{flex: 1, backgroundColor: colorPalette.default, paddingHorizontal: 10, paddingVertical: 5, marginHorizontal: 20, marginBottom: 20, marginTop: 5, borderRadius: 5}}>
                        <Text selectable style={{color: colorPalette.defaultText, fontSize: 14, lineHeight: 28, paddingBottom: 10}}>
                          { this.state.fullDescription }
                        </Text>
                      </ScrollView>
                    </View>
                  </KeyboardAvoidingView>
                </SafeAreaView>
              </Modal>
            </View>
          }
      </SafeAreaView>
    );
  }
}

const mapStateToProps = state => ({ generalInfo : state.general.info, loggedInUser: state.user });

export default connect(mapStateToProps, {
})(ProductDetailsScreen);