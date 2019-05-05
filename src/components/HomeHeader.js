import React, {Component} from 'react';
import { View, Image, Alert, TouchableOpacity} from 'react-native';

import { connect } from 'react-redux';
import Icon from 'react-native-vector-icons/Entypo';

import colorPalette from '../styles/colorPalatte';

import Input from '../components/Input';
import Button from '../components/Button';

import * as API from '../api/base';
import { Actions } from 'react-native-router-flux';

class HomeHeader extends Component {
  state = {
  }

  doSearch(){
    if(this.state.searchQuery != undefined && this.state.searchQuery != '')
    {
      Actions.product({searchQuery: this.state.searchQuery});
    }
  }

  render() {
    return (
      <View style={[{height: 50, backgroundColor: colorPalette.primary, flexDirection: 'row', paddingHorizontal: 10, paddingVertical: 8}, this.props.wrapperStyle]}>
        <Input type='text' placeholder='Search' wrapperStyle={{flex: 1}}
            returnKeyType="search"
            onSubmitEditing={()=> this.doSearch()}
            value={this.state.searchQuery}
            onChangeText={(text) => this.setState({searchQuery: text})} />
        <TouchableOpacity onPress={() => Actions.chat()} style={{width: 32, marginLeft: 10}}>
            <Icon style={{color: colorPalette.primaryText, alignSelf: 'center', marginTop: 4}} name='chat' size={26}/>
        </TouchableOpacity>
      </View>
    );
  }
}

const mapStateToProps = state => ({ generalInfo : state.general.info });

export default connect(mapStateToProps, {
})(HomeHeader);