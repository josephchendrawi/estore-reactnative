import React, {Component} from 'react';
import { View, Image, Alert, ActivityIndicator, TouchableOpacity, Text, Dimensions, StyleSheet, Platform } from 'react-native';

import { connect } from 'react-redux';
import GridView from 'react-native-super-grid';

import colorPalette from '../styles/colorPalatte';

import * as API from '../api/base';
import { Actions } from 'react-native-router-flux';

let deviceWidth = Dimensions.get('window').width;
let itemWidth = (deviceWidth-45)/2;

class ProductGrid extends Component {
  state = {
    isLoading: true,
    isRefreshing: false,
    dataSource: [],
    page: 1,
    pageSize: 10
  }

  getProduct(){
    API.GetProductRequest(this.props.searchQuery == undefined ? "" : this.props.searchQuery, this.props.category == undefined ? 0 : this.props.category, this.props.type == undefined ? 0 : this.props.type, 1, this.state.pageSize, this.props.loggedInUser.userName)
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

  getMoreProduct(){
    if(!this.state.isLoadingMore) {
        this.setState({isLoadingMore: true}, () => {
          API.GetProductRequest(this.props.searchQuery == undefined ? "" : this.props.searchQuery, this.props.category == undefined ? 0 : this.props.category, this.props.type == undefined ? 0 : this.props.type, this.state.page, this.state.pageSize, this.props.loggedInUser.userName)
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

  componentDidMount(){
    this.getProduct();
  }

  componentWillReceiveProps(nextProp){
    this.setState({
      isLoading: true
    }, () => {
      this.getProduct();
    });
  }

  render() {
    return (
      this.state.isLoading ?
        <ActivityIndicator color={colorPalette.loading} style={{flex: 1, height: 200}} />
      :
        <View style={[{ flex: 1 }, this.props.wrapperStyle]}>
          <GridView
            onRefresh={() => {
              this.setState({isRefreshing: true});
              this.getProduct();
            }}
            refreshing={this.state.isRefreshing}
            ListHeaderComponent={
              Platform.OS == 'android' &&
              <View style={{height: 15}}></View>
            }
            ListEmptyComponent={
              <View style={{flex: 1, alignItems: 'center', justifyContent: 'center', height: 200}}>
                <Text style={{textAlign: 'center', color: colorPalette.inactiveText}}>No data found.</Text>
              </View>
            }
            spacing={15}
            onEndReachedThreshold={0.1}
            onEndReached={() => {
              if(this.state.page < this.state.totalPage && !this.state.isLoadingMore) {
                  this.setState(prevState => ({
                      page: prevState.page + 1,
                  }),
                  () => {
                      this.getMoreProduct();
                  });
              }
            }}
            items={this.state.dataSource}
            renderItem={item => (
              <TouchableOpacity onPress={() => Actions.productdetails({product: item})} style={{alignItems:'center', justifyContent: 'center'}}>
                <Image source={{uri: item.imageThumb}} style={{ height: itemWidth, width: itemWidth}} />
                <View style={{width: itemWidth, backgroundColor: colorPalette.primary, paddingVertical: 5, paddingHorizontal: 10}}>
                  <Text numberOfLines={1} style={{color: colorPalette.primaryText, fontSize: 13}}>{item.name}</Text>
                  { this.props.loggedInUser.userName != undefined && <Text style={{color: colorPalette.primaryText, marginTop: 12}}>Rp. {item.price.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".")}</Text> }
                </View>
                {
                  (item.typeList != undefined && item.typeList.includes(1)) &&
                  <View style={{position: 'absolute', top: 0, left: 0, zIndex: 3}}>
                    <Image source={require('../assets/triangle-corner.png')} style={{ height: 75, width: 75, tintColor: colorPalette.primary}} />
                    <Text style={{color: colorPalette.primaryText, fontSize: 12, position: 'absolute', top: 20, left: 0, transform: [{rotate: '-45deg'}]}}>Best Seller</Text>
                  </View>
                }
              </TouchableOpacity>
            )}
          />
        </View>
    );
  }
}

const mapStateToProps = state => ({ loggedInUser: state.user });

export default connect(mapStateToProps, {
})(ProductGrid);