import React, {Component} from 'react';
import {TextInput, View, Image, StyleSheet, TouchableOpacity, ActivityIndicator} from 'react-native';
import Icon from 'react-native-vector-icons/AntDesign';
import { Dropdown } from 'react-native-material-dropdown';

import colorPalette from '../styles/colorPalatte';

class Input extends Component {
  state = {
    checked : this.props.checked
  }

  componentWillReceiveProps(nextProp){
    this.setState({checked: nextProp.checked});
  }

  render() {
    switch(this.props.type){
        case 'text' :
            return(
                <View style={[styles.wrapper, {backgroundColor: colorPalette.default}, this.props.wrapperStyle]}>
                    <TextInput style={[styles.container, {color: !this.props.disabled ? colorPalette.defaultText : colorPalette.inactiveText}, this.props.style]}
                        underlineColorAndroid="transparent"
                        selectionColor={colorPalette.defaultText}
                        returnKeyType={this.props.returnKeyType && "next"}
                        selectTextOnFocus 
                        autoCapitalize="none" 
                        multiline={this.props.multiline}
                        numberOfLines = {this.props.numberOfLines}
                        editable={!this.props.disabled} selectTextOnFocus={!this.props.disabled}
                        autoCorrect={false} 
                        value={this.props.value}
                        onChangeText={this.props.onChangeText}
                        onSubmitEditing={this.props.onSubmitEditing}
                        onKeyPress={this.props.onKeyPress}
                        returnKeyType={this.props.returnKeyType}
                        blurOnSubmit={this.props.blurOnSubmit}
                        placeholder={this.props.placeholder}
                        placeholderTextColor={colorPalette.placeholderText} />
                </View>
            );
        case 'password' :
            return(
                <View style={[styles.wrapper, {backgroundColor: colorPalette.default}, this.props.wrapperStyle]}>
                    <TextInput style={[styles.container, {color: colorPalette.defaultText}, this.props.style]}
                        underlineColorAndroid="transparent"
                        selectionColor={colorPalette.defaultText}
                        returnKeyType={this.props.returnKeyType && "next"}
                        selectTextOnFocus 
                        secureTextEntry
                        value={this.props.value}
                        onChangeText={this.props.onChangeText}
                        onSubmitEditing={this.props.onSubmitEditing}
                        returnKeyType={this.props.returnKeyType}
                        blurOnSubmit={this.props.blurOnSubmit}
                        placeholder={this.props.placeholder}
                        placeholderTextColor={colorPalette.placeholderText} />
            </View>
            );
        case 'checkbox' :
            return(
                <TouchableOpacity style={this.props.wrapperStyle} onPress={() => {this.props.onChangeValue && this.props.onChangeValue(!this.state.checked);}}>
                    <Icon style={[{color: this.state.checked ? colorPalette.primary : colorPalette.inactive}, this.props.style]}
                        name={this.state.checked ? 'checksquare' : 'checksquareo'} size={this.props.size || 18} />
                </TouchableOpacity>
            );
        case 'dropdown' :
            return(
                <View style={[styles.wrapper, {backgroundColor: colorPalette.default, height: 44}, this.props.wrapperStyle]}>
                    <Dropdown style={{flex: 1}}
                        containerStyle={[styles.container, {borderBottomColor: 'transparent'}, this.props.containerStyle]}
                        pickerStyle={{backgroundColor: colorPalette.default}}
                        lineWidth={0}
                        baseColor={colorPalette.inactiveText}
                        textColor={this.props.selectedColor == null ? colorPalette.defaultText : this.props.selectedColor}
                        itemColor={colorPalette.inactiveText}
                        selectedItemColor={this.props.selectedColor == null ? colorPalette.defaultText : this.props.selectedColor}
                        animationDuration={0}
                        dropdownOffset={!this.props.dropdownOffset ? {top: 14, left: 0} : this.props.dropdownOffset}
                        rippleInsets={{top: 0, left: 0}}
                        rippleOpacity={0}
                        label = {this.props.label}
                        fontSize = {14}
                        labelFontSize = {1}
                        renderAccessory = {() => this.props.isLoading ? <ActivityIndicator style={{paddingRight: 3}} /> : <Icon name="caretdown" color={this.props.data == null ? colorPalette.inactiveText: colorPalette.defaultText} style={{marginTop: 2}} />}
                        data={this.props.data}
                        value={this.props.value}
                        onChangeText={this.props.onChangeText}
                    />
                </View>
            );
    }
  }
}

const styles = StyleSheet.create({
    wrapper: {
        flexDirection: 'row',
        alignItems: 'center'
    },
    container: {
        flex: 1,
        paddingRight: 10,
        paddingLeft: 10,
        paddingVertical: 5,
        minHeight: 44,
        maxHeight: 100
    },
});

export default Input;