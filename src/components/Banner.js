import React, {Component} from 'react';
import { View, Image, Alert, ActivityIndicator } from 'react-native';

import { connect } from 'react-redux';

import Swiper from 'react-native-swiper';

import colorPalette from '../styles/colorPalatte';

import * as API from '../api/base';
import { Actions } from 'react-native-router-flux';
import { withNavigationFocus } from 'react-navigation';

class Banner extends Component {
  state = {
    isLoading: true
  }

  getBanner(){
    API.GetBannerRequest()
      .then((response) => {
        if(response.data.sts == 0){
          this.setState(
            {
              isLoading: false,
              dataSource: response.data.result
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
    this.getBanner();
  }

  render() {
    let Slider;

    if(!this.props.isFocused && this.state.dataSource != undefined)
    {
      Slider = <Image style={{flex: 1}} resizeMode='cover' source={{uri: this.state.dataSource[0] }} />;
    }
    else{
      if(this.state.isLoading){
        Slider = <ActivityIndicator color={colorPalette.loading} style={{flex: 1}} />;
      }
      else{
        var slides = [];
        this.state.dataSource.map((item, i) => {
          slides.push(
            <View key={i} style={{flex: 1}}>
              <Image style={{flex: 1}} resizeMode='cover' source={{uri: item }} />
            </View>
          )
        });

        Slider = <Swiper autoplay autoplayTimeout={5}
                    loadMinimalLoader={<ActivityIndicator color={colorPalette.loading} />}
                    dot={<View style={{backgroundColor: colorPalette.inactive, width: 8, height: 8, marginLeft: 3, marginRight: 3, marginTop: 3, marginBottom: 3,}} />}
                    activeDot={<View style={{backgroundColor: colorPalette.primary, width: 8, height: 8, marginLeft: 3, marginRight: 3, marginTop: 3, marginBottom: 3,}} />}
                    paginationStyle={{marginBottom: -10}}
                  >
                    {slides}
                  </Swiper>;
      }
    }

    return (
      <View style={[{height: 180}, this.props.wrapperStyle]}>
        {Slider}
      </View>
    );
  }
}

export default withNavigationFocus(Banner);