import React, {Component} from 'react';
import {Text, View, TouchableOpacity, Image, StyleSheet, ActivityIndicator} from 'react-native';

import colorPalette from '../styles/colorPalatte';

class Button extends Component {
  state = {}

  render() {
    if(this.props.disabled){
        return(
            <TouchableOpacity onPress={this.props.onPress} disabled={true} style={[styles.wrapper, this.props.wrapperStyle]}>
            <Text style={[styles.container, { color: colorPalette.inactiveText, backgroundColor: colorPalette.inactive }, this.props.style]}>
                {this.props.value}
            </Text>
            </TouchableOpacity>
        );
    }
    else{
        switch(this.props.type){
            case 'primary' :
                return(
                    <TouchableOpacity onPress={this.props.onPress} style={[styles.wrapper, this.props.wrapperStyle]}>
                    <Text style={[styles.container, { color: colorPalette.primaryText, backgroundColor: colorPalette.primary }, this.props.style]}>
                        {this.props.value}
                    </Text>
                    </TouchableOpacity>
                );
            case 'info' :
                return(
                    <TouchableOpacity onPress={this.props.onPress} style={[styles.wrapper, this.props.wrapperStyle]}>
                    <Text style={[styles.container, { color: colorPalette.infoText, backgroundColor: colorPalette.info }, this.props.style]}>
                        {this.props.value}
                    </Text>
                    </TouchableOpacity>
                );
            case 'success' :
                return(
                    <TouchableOpacity onPress={this.props.onPress} style={[styles.wrapper, this.props.wrapperStyle]}>
                    <Text style={[styles.container, { color: colorPalette.successText, backgroundColor: colorPalette.success }, this.props.style]}>
                        {this.props.value}
                    </Text>
                    </TouchableOpacity>
                );
            case 'warning' :
                return(
                    <TouchableOpacity onPress={this.props.onPress} style={[styles.wrapper, this.props.wrapperStyle]}>
                    <Text style={[styles.container, { color: colorPalette.warningText, backgroundColor: colorPalette.warning }, this.props.style]}>
                        {this.props.value}
                    </Text>
                    </TouchableOpacity>
                );
            case 'danger' :
                return(
                    <TouchableOpacity onPress={this.props.onPress} style={[styles.wrapper, this.props.wrapperStyle]}>
                    <Text style={[styles.container, { color: colorPalette.dangerText, backgroundColor: colorPalette.danger }, this.props.style]}>
                        {this.props.value}
                    </Text>
                    </TouchableOpacity>
                );
            case 'default' :
                return(
                    <TouchableOpacity onPress={this.props.onPress} style={[styles.wrapper, this.props.wrapperStyle]}>
                    <Text style={[styles.container, { color: colorPalette.defaultText, backgroundColor: colorPalette.default }, this.props.style]}>
                        {this.props.value}
                    </Text>
                    </TouchableOpacity>
                );
        }
    }
  }
}

const styles = StyleSheet.create({
    wrapper: {
        flexDirection: 'row',
        alignItems: 'center'
    },
    container: {
        overflow:'hidden',
        textAlign: 'center',
        fontWeight: 'bold', 
        paddingVertical: 10,
        paddingHorizontal: 20,
    },
});

export default Button;