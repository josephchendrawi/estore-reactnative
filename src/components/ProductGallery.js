import React, {Component} from 'react';
import { View, Image, Alert, ActivityIndicator, Modal, TouchableOpacity, Platform, Dimensions, SafeAreaView } from 'react-native';

import { connect } from 'react-redux';

import Swiper from 'react-native-swiper';
import ImageViewer from 'react-native-image-zoom-viewer';
import Icon from 'react-native-vector-icons/Entypo';

import colorPalette from '../styles/colorPalatte';

import * as API from '../api/base';
import { Actions } from 'react-native-router-flux';

const isX = Platform.OS === "ios" && (Dimensions.get("window").height > 800 || Dimensions.get("window").width > 800) ? true : false

class ProductGallery extends Component {
  state = {
    showImageViewer: false,
    showImageIndex: 0,
    swiperImageIndex: 0
  }

  swiper: Object

  render() {
    let Slider;
    var slides = [];
    var imageViewerUrls = [];
    this.props.imageList.map((item, i) => {
      slides.push(
        <TouchableOpacity activeOpacity={1} onPress={() => this.setState({showImageViewer: true})} key={i} style={{flex: 1}}>
          <Image style={{flex: 1}} resizeMode='cover' source={{uri: item}} />
        </TouchableOpacity>
      );
    });
    this.props.largeImageList.map((item, i) => {
      imageViewerUrls.push(
        {
          url: item,
        }
      );
    });

    Slider = <Swiper loop={false} ref={(ref) => {this.swiper = ref}}
                onIndexChanged={(newIndex)=> this.setState({showImageIndex: newIndex, swiperImageIndex: newIndex})}
                loadMinimalLoader={<ActivityIndicator color={colorPalette.loading} />}
                dot={<View style={{backgroundColor: colorPalette.inactive, width: 8, height: 8, marginLeft: 3, marginRight: 3, marginTop: 3, marginBottom: 3,}} />}
                activeDot={<View style={{backgroundColor: colorPalette.primary, width: 8, height: 8, marginLeft: 3, marginRight: 3, marginTop: 3, marginBottom: 3,}} />}
                paginationStyle={{marginBottom: -10}}>
                {slides}
              </Swiper>;

    return (
      <View style={[{height: this.props.height || 200}, this.props.wrapperStyle]}>
        {Slider}
        {
          this.props.enableImageViewer &&
          <Modal
          animationType="none"
          transparent={true}
          onRequestClose={() => { this.setState({showImageViewer: false}); }}
          visible={this.state.showImageViewer}>
          <SafeAreaView style={{flex: 1, justifyContent: 'flex-end', marginBottom: isX ? 32 : 0}}>
            <View style={{alignItems: 'flex-end', backgroundColor: 'black'}}>
              <TouchableOpacity onPress={() => {this.setState({showImageViewer: false}); this.swiper.scrollBy(this.state.showImageIndex - this.state.swiperImageIndex, false)}}>
                <Icon name="cross" size={40} style={{color: 'white'}} />
              </TouchableOpacity>
            </View>
            <View style={{flex: 1}}>
              {
                <ImageViewer imageUrls={imageViewerUrls} index={this.state.showImageIndex}
                  onChange={(newIndex)=> this.setState({showImageIndex: newIndex})}
                  />
              }
            </View>
          </SafeAreaView>
        </Modal>
        }
      </View>
    );
  }
}

export default ProductGallery;