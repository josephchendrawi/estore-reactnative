import React, {Component} from 'react';
import { View, Text, Alert, SafeAreaView, ScrollView } from 'react-native';

import { connect } from 'react-redux';
import { userLogin } from '../actions/userAction';

import globalStyle from '../styles/globalStyle';
import colorPalette from '../styles/colorPalatte';

import Input from '../components/Input';
import Button from '../components/Button';

import * as API from '../api/base';
import { Actions } from 'react-native-router-flux';

class RegisterScreen extends Component {
  state = {
    isRegistering: false,
  }

  componentDidMount(){
    API.GetCountryRequest()
    .then((response) => {
      if(response.data.sts == 0){
        this.setState({
          country_list : response.data.result.map((item, i) => {
              return {
                  value: item.id,
                  label: item.name
              }
          })
        });
      }
      else{
        Alert.alert(null, response.data.msg);
      }
    })
    .catch((error)=>{
      Alert.alert(null, error.message);
    });
  }

  onSelectCountry = (countryid) => {
    this.setState({countryid: countryid, isProvinceLoading: true, provinceid: '', province_list: undefined, districtid: '', district_list: undefined, cityid: '', city_list: undefined});
    API.GetProvinsiRequest(countryid)
    .then((response) => {
      if(response.data.sts == 0){
        this.setState({
          isProvinceLoading: false,
          province_list : response.data.result.map((item, i) => {
              return {
                  value: item.id,
                  label: item.name
              }
          })
        });
      }
      else{
        Alert.alert(null, response.data.msg);
      }
    })
    .catch((error)=>{
      Alert.alert(null, error.message);
    });
  }

  onSelectProvince = (provinceid) => {
    this.setState({provinceid: provinceid, isDistrictLoading: true, districtid: '', district_list: undefined, cityid: '', city_list: undefined});
    API.GetKabupatenRequest(provinceid)
    .then((response) => {
      if(response.data.sts == 0){
        this.setState({
          isDistrictLoading: false,
          district_list : response.data.result.map((item, i) => {
              return {
                  value: item.id,
                  label: item.name
              }
          })
        });
      }
      else{
        Alert.alert(null, response.data.msg);
      }
    })
    .catch((error)=>{
      Alert.alert(null, error.message);
    });
  }

  onSelectDistrict = (districtid) => {
    this.setState({districtid: districtid, isCityLoading: true, cityid: '', city_list: undefined});
    API.GetCityRequest(districtid)
    .then((response) => {
      if(response.data.sts == 0){
        this.setState({
          isCityLoading: false,
          city_list : response.data.result.map((item, i) => {
              return {
                  value: item.id,
                  label: item.name
              }
          })
        });
      }
      else{
        Alert.alert(null, response.data.msg);
      }
    })
    .catch((error)=>{
      Alert.alert(null, error.message);
    });
  }

  doRegister = () => {
    if(this.state.email == null){
      Alert.alert(null, "Email is required.");
    }
    else if(this.state.password == null){
      Alert.alert(null, "Password is required.");
    }
    else if(this.state.fullname == null){
      Alert.alert(null, "Full Name is required.");
    }
    else if(this.state.contactno == null){
      Alert.alert(null, "Contact No. is required.");
    }
    else if(this.state.address == null){
      Alert.alert(null, "Address is required.");
    }
    else if(this.state.countryid == null){
      Alert.alert(null, "Country is required.");
    }
    else if(this.state.provinceid == null){
      Alert.alert(null, "Province is required.");
    }
    else if(this.state.districtid == null){
      Alert.alert(null, "District is required.");
    }
    else if(this.state.cityid == null){
      Alert.alert(null, "City is required.");
    }
    else if(this.state.zipcode == null){
      Alert.alert(null, "Zip Code is required.");
    }
    else{
      this.setState({ isRegistering: true });

      API.SetCustomerRequest(this.state.email, this.state.password, this.state.fullname, this.state.contactno, this.state.address, this.state.cityid, this.state.zipcode)
      .then((response) => {
        if(response.data.sts == 0){
          if(this.props.generalInfo.needEmailVerify == true){
            Actions.replace('verifyemail', {email: this.state.email});
          }
          else if(this.props.generalInfo.needPhoneVerify == true){
            Actions.replace('verifyphone', {contactno: this.state.contactno});
          }
          else{
            Alert.alert(null, "Successfully registered.");
            Actions.pop();
          }
        }
        else{
          Alert.alert(null, response.data.msg);
          this.setState({ isRegistering: false });
        }
      })
      .catch((error)=>{
        this.setState({ isRegistering: false });
        Alert.alert(null, error.message);
      });
    }
  }

  render() {
    return (
      <SafeAreaView style={[globalStyle.container]}>
        <ScrollView bounces={false}>
          <View style={{ alignItems: 'center' }}>
            <View style={{ marginTop: 40, marginBottom: 30 }}>
              <Text style={{fontSize: 24, color: colorPalette.defaultText}}>REGISTRATION</Text>
            </View>
            <View style={{ alignItems: 'center', paddingHorizontal: 30 }}>
              <Input type='text' placeholder='Email' wrapperStyle={{marginBottom: 10}}
                    value={this.state.email}
                    onChangeText={(text) => this.setState({email: text})} />
              <Input type='password' placeholder='Password' wrapperStyle={{marginBottom: 10}}
                    value={this.state.password}
                    onChangeText={(text) => this.setState({password: text})} />
              <Input type='text' placeholder='Full Name' wrapperStyle={{marginBottom: 10}}
                    value={this.state.fullname}
                    onChangeText={(text) => this.setState({fullname: text})} />
              <Input type='text' placeholder='Contact No.' wrapperStyle={{marginBottom: 10}}
                    value={this.state.contactno}
                    onChangeText={(text) => this.setState({contactno: text})} />
              <Input type='text' placeholder='Address' wrapperStyle={{marginBottom: 10}}
                    value={this.state.address}
                    onChangeText={(text) => this.setState({address: text})} />
              <Input type='dropdown' label='Country' wrapperStyle={{marginBottom: 10}}
                    data={this.state.country_list}
                    isLoading={this.state.country_list == undefined}
                    value={this.state.countryid}
                    onChangeText={(newSelectedValue) => {this.onSelectCountry(newSelectedValue)}} />
              <Input type='dropdown' label='Province' wrapperStyle={{marginBottom: 10}}
                    data={this.state.province_list}
                    isLoading={this.state.isProvinceLoading}
                    value={this.state.provinceid}
                    onChangeText={(newSelectedValue) => {this.onSelectProvince(newSelectedValue)}} />
              <Input type='dropdown' label='District' wrapperStyle={{marginBottom: 10}}
                    data={this.state.district_list}
                    isLoading={this.state.isDistrictLoading}
                    value={this.state.districtid}
                    onChangeText={(newSelectedValue) => {this.onSelectDistrict(newSelectedValue)}} />
              <Input type='dropdown' label='City' wrapperStyle={{marginBottom: 10}}
                    data={this.state.city_list}
                    isLoading={this.state.isCityLoading}
                    value={this.state.cityid}
                    onChangeText={(newSelectedValue) => {this.setState({cityid: newSelectedValue})}} />
              <Input type='text' placeholder='Zip Code' wrapperStyle={{marginBottom: 10}}
                    value={this.state.zipcode}
                    onChangeText={(text) => this.setState({zipcode: text})} />
              <Button type='primary' value={!this.state.isRegistering ? 'REGISTER' : 'REGISTERING...'} disabled={this.state.isRegistering} onPress={() => this.doRegister()} style={{flex: 1}} wrapperStyle={{marginBottom: 10}} />
              <Button type='default' value='BACK' onPress={() => Actions.pop()} style={{flex: 1, marginBottom: 10}} />
            </View>
          </View>
        </ScrollView>
      </SafeAreaView>
    );
  }
}

const mapStateToProps = state => ({ generalInfo: state.general.info });

export default connect(mapStateToProps, {
  userLogin
})(RegisterScreen);