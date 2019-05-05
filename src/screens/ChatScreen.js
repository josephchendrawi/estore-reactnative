import React, {Component} from 'react';
import { View, Image, Alert, TouchableOpacity, SafeAreaView, Text, ScrollView, FlatList, ActivityIndicator, Platform } from 'react-native';

import { connect } from 'react-redux';
const signalR = require("@aspnet/signalr");

import DeviceInfo from 'react-native-device-info';

import Icon from 'react-native-vector-icons/Entypo';

import globalStyle from '../styles/globalStyle';
import colorPalette from '../styles/colorPalatte';

import Input from '../components/Input';
import Button from '../components/Button';
import Header from '../components/Header';

import * as API from '../api/base';
import { Actions } from 'react-native-router-flux';

const DEVICE = DeviceInfo.getUniqueID();
const PLATFORM = Platform.OS.toUpperCase();

class ChatScreen extends Component {
  state = {
    isLoading: false,
    allowSending: false,
    messages: [],
    page: 1,
    pageSize: 20,
    newMessageCount: 0,
    isLoadingMoreMessages: false
  }

  getMessages(){
    API.GetCustomerChatRequest(1, this.state.pageSize, this.props.loggedInUser.userName, this.props.loggedInUser.accessToken)
      .then((response) => {
        if(response.data.sts == 0){
          this.setState(
            {
              isLoading: false,
              messages: response.data.result,
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

  getMoreMessages(){
    if(!this.state.isLoadingMoreMessages) {
        this.setState({isLoadingMoreMessages: true}, () => {
            API.GetCustomerChatRequest(this.state.page, this.state.pageSize, this.props.loggedInUser.userName, this.props.loggedInUser.accessToken)
            .then((response) => {
                if(response.data.sts == 0){
                this.setState(prevState => (
                    {
                        isLoadingMoreMessages: false,
                        messages: [
                            ...prevState.messages,
                            ...response.data.result
                        ]
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

  setupSignalR(){
    this.connection = new signalR.HubConnectionBuilder()
        .withUrl(API.signalr_url(this.props.loggedInUser.userName, this.props.loggedInUser.accessToken))
        .configureLogging(signalR.LogLevel.Information)
        .build();

    this.connection.on("UserReceive", (json) => {
        let result = JSON.parse(json);
        this.setState(prevState => ({
          messages: [
              {
                  message: result.Message,
                  createdBy: result.CreatedBy,
                  isSending: false,
              },
              ...this.state.messages
          ]
        }));
    });

    this.connection.start()
        .then(() => { 
            //console.warn('signalR connected');
            this.setState({ allowSending: true });

            if(this.props.chatWithProduct != undefined){
                //console.warn(this.props.chatWithProduct);
                this.sendMessage(this.props.chatWithProduct.id, this.props.chatWithProduct.name + " [" + this.props.chatWithProduct.code + "]", this.props.chatWithProduct.imageThumb, this.props.chatWithProduct.price, this.props.chatWithProduct.description);
            }
        })
        .catch((err) => {
            console.warn("Error signalR : " + err);
        });

    // this.connection.onclose(() => {
      
    // })
  }

  componentDidMount(){
    this.getMessages();
    this.setupSignalR();
  }

  componentWillUnmount() {
    this.connection.stop();
  }

  sendMessage(product_id = 0, product_name = undefined, product_image = undefined, product_price = undefined, product_desc = undefined){
    let newMessage = this.state.newMessage == undefined ? "" : this.state.newMessage;
    if(newMessage != "" || product_id != 0){
      let newMessageId = this.state.newMessageCount + 1;

      this.setState(prevState => ({
        newMessage: '',
        messages: [
            {
                id: newMessageId,
                message: newMessage,
                productId: product_id,
                productName: product_name,
                productImageThumb: product_image,
                productPrice: product_price,
                productDescription: product_desc,
                createdBy: this.props.loggedInUser.userName,
                isSending: true,
                newMessageCount: prevState.newMessageCount + 1
            },
            ...this.state.messages
        ]
      }));

      var message = {
          product_id: product_id,
          message: newMessage,
          accesstoken: this.props.loggedInUser.accessToken,
          email: this.props.loggedInUser.userName,
          platform: PLATFORM,
          device: DEVICE,
      }
      var signature = API.generateSignature(message);
      message.signature = signature;

      this.connection.invoke("UserSend", JSON.stringify(message))
          .then(() => {
              this.setState(prevState => ({
                  messages: prevState.messages.map((obj) => {
                      if(obj.id == newMessageId)
                      {
                          obj.isSending = false;
                      }
                      return obj;
                  })
              }))
          })
          .catch(err => console.warn(err.toString()));
    }
  }

  render() {
    return (
      <SafeAreaView style={[globalStyle.container]}>
        <Header title="Chat" />
        {
          this.state.isLoading ?
            <ActivityIndicator color={colorPalette.loading} style={{flex: 1}} />
          :
            <View style={{flex: 1}}>
              <FlatList extraData={this.state}
                inverted
                onEndReachedThreshold={0.1}
                onEndReached={() => {
                    if(this.state.page < this.state.totalPage && !this.state.isLoadingMoreMessages) {
                        this.setState(prevState => ({
                            page: prevState.page + 1,
                        }),
                        () => {
                            this.getMoreMessages();
                        });
                    }
                }}
                data={this.state.messages}
                keyExtractor={(item, index) => index.toString()}
                renderItem={({item}) => (
                  <View style={{flexDirection: 'row', alignItems: 'center', justifyContent: item.createdBy == 'admin' ? 'flex-start' : 'flex-end'}}>
                    {
                      item.isSending && <ActivityIndicator color={colorPalette.loading} />
                    }
                    {
                      item.createdBy == 'admin' ?
                      <View style={{backgroundColor: colorPalette.default, paddingHorizontal: 15, paddingVertical: 10, borderRadius: 10, marginHorizontal: 10, marginVertical: 5}}>
                        <Text selectable style={{color: colorPalette.defaultText, textAlign: 'left'}}>{item.message}</Text>
                      </View>
                      :
                      <View style={{backgroundColor: colorPalette.primary, paddingHorizontal: 15, paddingVertical: 10, borderRadius: 10, marginHorizontal: 10, marginVertical: 5}}>
                      {
                        item.productId == undefined || item.productId == 0 ? // 0 = no product id
                        <Text selectable style={{color: colorPalette.primaryText, textAlign: 'left'}}>{item.message}</Text>
                        :
                        <TouchableOpacity onPress={() => Actions.productdetails({product: {id: item.productId, price: item.productPrice, description: item.productDescription, name: item.productName}})} style={{flexDirection: 'row'}}>
                            <Image source={{uri: item.productImageThumb}} style={{ height: 40, width: 40}} />
                            <View style={{paddingLeft: 10}}>
                            <Text style={{color: colorPalette.primaryText, fontSize: 13}}>{item.productName}</Text>
                            </View>
                        </TouchableOpacity>
                      }
                      </View>
                    }
                  </View>
                )}
              />
              <View style={{flexDirection: 'row'}}>
                <Input type='text' placeholder='...' wrapperStyle={{flex: 7}}
                  value={this.state.newMessage}
                  //multiline
                  //style={{maxHeight: 44, paddingTop: 12}}
                  //onKeyPress={(e) => console.warn(e.nativeEvent.key)}
                  returnKeyType="send"
                  onSubmitEditing={() => this.sendMessage()}
                  blurOnSubmit={false}
                  onChangeText={(text) => this.setState({newMessage: text})} />
                <Button type='primary' value='SEND' disabled={!this.state.allowSending} onPress={() => this.sendMessage()} style={{flex: 1, paddingVertical: 15}} wrapperStyle={{flex: 2}} />
              </View>
            </View>
          }
      </SafeAreaView>
    );
  }
}

const mapStateToProps = state => ({ generalInfo : state.general.info, loggedInUser: state.user });

export default connect(mapStateToProps, {
})(ChatScreen);