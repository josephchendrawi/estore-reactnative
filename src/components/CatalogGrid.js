import React, {Component} from 'react';
import { View, Image, Alert, ActivityIndicator, TouchableOpacity, Text, Dimensions } from 'react-native';

import { connect } from 'react-redux';
import GridView from 'react-native-super-grid';

import Icon from 'react-native-vector-icons/Entypo';

import colorPalette from '../styles/colorPalatte';

import * as API from '../api/base';
import { Actions } from 'react-native-router-flux';

let deviceWidth = Dimensions.get('window').width;
let itemWidth = (deviceWidth-45)/2;

class CatalogGrid extends Component {
  state = {
    isLoading: true,
    dataSource: [],
  }

  getCatalog(){
    API.GetCategoryParentRequest()
      .then((response) => {
        if(response.data.sts == 0){
          this.setState(
            {
              isLoading: false,
              dataSource: response.data.category
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

  getChildCatalog(parent){
    this.setState(
      {
        isLoading: true,
        parent: parent
      }
    );
    API.GetCategoryChildRequest(parent.id)
      .then((response) => {
        if(response.data.sts == 0){
          this.setState(
            {
              isLoading: false,
              dataSource: response.data.category
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

  componentDidMount(){
    this.getCatalog();
  }

  render() {
    return (
      this.state.isLoading ?
        <ActivityIndicator color={colorPalette.loading} style={{flex: 1}} />
      :
        <View style={[{ flex: 1 }, this.props.wrapperStyle]}>
          {
            this.state.parent &&
            <TouchableOpacity onPress={() => this.getCatalog(this.state.parent.id)} style={{justifyContent:'center', backgroundColor: colorPalette.inactive, borderRadius: 4, marginHorizontal: 15, marginTop: 15}}>
              <Text style={{color: colorPalette.inactiveText, fontSize: 13, paddingHorizontal: 10, paddingVertical: 15}}>
                <Icon name='chevron-left' /> {this.state.parent.name}
              </Text>
            </TouchableOpacity>
          }
          <GridView
            spacing={15}
            ListEmptyComponent={
              <View style={{flex: 1, alignItems: 'center', justifyContent: 'center', height: 200}}>
                <Text style={{textAlign: 'center', color: colorPalette.inactiveText}}>No data found.</Text>
              </View>
            }
            items={this.state.dataSource}
            renderItem={item => (
              <TouchableOpacity onPress={() => {item.hasChild == true ? this.getChildCatalog(item) : Actions.product({category: item});}} style={{width: itemWidth, justifyContent:'center', backgroundColor: colorPalette.default, borderRadius: 4}}>
                <Text style={{color: colorPalette.inactiveText, fontSize: 13, paddingHorizontal: 10, paddingVertical: 15}}>
                  {item.name}
                </Text>
              </TouchableOpacity>
            )}
          />
        </View>
    );
  }
}

export default CatalogGrid;