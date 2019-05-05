import React, {Component} from 'react';
import { View, Image, Text, Alert, TouchableOpacity } from 'react-native';

import { connect } from 'react-redux';
import Icon from 'react-native-vector-icons/Entypo';

import colorPalette from '../styles/colorPalatte';

import Input from '../components/Input';
import Button from '../components/Button';

import * as API from '../api/base';
import { Actions } from 'react-native-router-flux';

class Header extends Component {
  state = {
  }

  render() {
    return (
      <View style={[{height: 50, justifyContent: 'center', alignItems: 'center', backgroundColor: colorPalette.primary, flexDirection: 'row', paddingHorizontal: 10, paddingVertical: 8}, this.props.wrapperStyle]}>
        <Text style={{flex: 1, textAlign : 'center', color: colorPalette.primaryText, fontSize: 18}}>
          {this.props.title}
        </Text>
        {
          !this.props.hideBackBtn &&
          <TouchableOpacity style={{width: 32, position: 'absolute', left: 0}} onPress={() => Actions.pop()}>
            <Icon style={{color: colorPalette.primaryText, marginTop: 3}} name='chevron-left' size={36}/>
          </TouchableOpacity>
        }
      </View>
    );
  }
}

const mapStateToProps = state => ({ generalInfo : state.general.info });

export default connect(mapStateToProps, {
})(Header);