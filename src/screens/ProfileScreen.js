import React, {Component} from 'react';
import { View, Text, Alert, ActivityIndicator, SafeAreaView, ScrollView } from 'react-native';

import { connect } from 'react-redux';
import { userLogin } from '../actions/userAction';

import globalStyle from '../styles/globalStyle';
import colorPalette from '../styles/colorPalatte';

import Input from '../components/Input';
import Button from '../components/Button';
import Header from '../components/Header';

import * as API from '../api/base';
import { Actions } from 'react-native-router-flux';

class ProfileScreen extends Component {
  state = {
    isGettingProfile: true,
    isUpdatingProfile: false,
  }

  componentDidMount(){
    API.GetCustomerProfileRequest(this.props.loggedInUser.userName, this.props.loggedInUser.accessToken)
      .then((response) => {
        if(response.data.sts == 0){
          this.setState({
            isGettingProfile: false,
            email: response.data.result.email,
            fullname: response.data.result.fullName,
            contactno: response.data.result.contact,
            address: response.data.result.address,
            countryName: "Indonesia", //response.data.result.countryName,
            provinceName: response.data.result.provinsiName,
            districtName: response.data.result.kabupatenName,
            cityName: response.data.result.cityName,
            cityid_unchanged: response.data.result.cityId,
            zipcode: response.data.result.zipcode,
          });
        }
        else{
          Alert.alert(null, response.data.msg);
        }
      })
      .catch((error)=>{
        console.warn(error);
      });

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

  doUpdateProfile = () => {
    if(this.state.fullname == null){
      Alert.alert(null, "Full Name is required.");
    }
    else if(this.state.contactno == null){
      Alert.alert(null, "Contact No. is required.");
    }
    else if(this.state.address == null){
      Alert.alert(null, "Address is required.");
    }
    else if(this.state.zipcode == null){
      Alert.alert(null, "Zip Code is required.");
    }
    else{
      this.setState({ isUpdatingProfile: true });

      API.SetCustomerProfileRequest(this.state.fullname, this.state.contactno, this.state.address, this.state.cityid == undefined ? this.state.cityid_unchanged : this.state.cityid, this.state.zipcode, this.props.loggedInUser.userName, this.props.loggedInUser.accessToken)
      .then((response) => {
        if(response.data.sts == 0){
          Alert.alert(null, "Profile is successfully updated.");
          Actions.pop();
        }
        else{
          Alert.alert(null, response.data.msg);
          this.setState({ isUpdatingProfile: false });
        }
      })
      .catch((error)=>{
        this.setState({ isUpdatingProfile: false });
        Alert.alert(null, error.message);
      });
    }
  }

  render() {
    return (
      <SafeAreaView style={[globalStyle.container]}>
        <Header title='Profile' />
        {
          this.state.isGettingProfile ?
            <ActivityIndicator color={colorPalette.loading} style={{flex: 1}} />
          :
          <ScrollView bounces={false}>
            <View style={{ alignItems: 'center', paddingHorizontal: 30, marginVertical: 10 }}>
              <Input type='text' placeholder='Email' wrapperStyle={{marginBottom: 10}} disabled
                    value={this.state.email}
                    onChangeText={(text) => this.setState({email: text})} />
              {/* <Input type='password' placeholder='Password (unchanged)' wrapperStyle={{marginBottom: 10}}
                    value={this.state.password}
                    onChangeText={(text) => this.setState({password: text})} /> */}
              <Input type='text' placeholder='Full Name' wrapperStyle={{marginBottom: 10}}
                    value={this.state.fullname}
                    onChangeText={(text) => this.setState({fullname: text})} />
              <Input type='text' placeholder='Contact No.' wrapperStyle={{marginBottom: 10}}
                    value={this.state.contactno}
                    onChangeText={(text) => this.setState({contactno: text})} />
              <Input type='text' placeholder='Address' wrapperStyle={{marginBottom: 10}}
                    value={this.state.address}
                    onChangeText={(text) => this.setState({address: text})} />
              <Input type='dropdown' label={this.state.countryName} wrapperStyle={{marginBottom: 10}}
                    data={this.state.country_list}
                    isLoading={this.state.country_list == undefined}
                    value={this.state.countryid}
                    onChangeText={(newSelectedValue) => {this.onSelectCountry(newSelectedValue)}} />
              <Input type='dropdown' label={this.state.provinceName} wrapperStyle={{marginBottom: 10}}
                    data={this.state.province_list}
                    isLoading={this.state.isProvinceLoading}
                    value={this.state.provinceid}
                    onChangeText={(newSelectedValue) => {this.onSelectProvince(newSelectedValue)}} />
              <Input type='dropdown' label={this.state.districtName} wrapperStyle={{marginBottom: 10}}
                    data={this.state.district_list}
                    isLoading={this.state.isDistrictLoading}
                    value={this.state.districtid}
                    onChangeText={(newSelectedValue) => {this.onSelectDistrict(newSelectedValue)}} />
              <Input type='dropdown' label={this.state.cityName} wrapperStyle={{marginBottom: 10}}
                    data={this.state.city_list}
                    isLoading={this.state.isCityLoading}
                    value={this.state.cityid}
                    onChangeText={(newSelectedValue) => {this.setState({cityid: newSelectedValue})}} />
              <Input type='text' placeholder='Zip Code' wrapperStyle={{marginBottom: 10}}
                    value={this.state.zipcode}
                    onChangeText={(text) => this.setState({zipcode: text})} />
              <Button type='primary' value={!this.state.isUpdatingProfile ? 'UPDATE' : 'UPDATING...'} disabled={this.state.isUpdatingProfile} onPress={() => this.doUpdateProfile()} style={{flex: 1}} wrapperStyle={{marginBottom: 10}} />
            </View>
          </ScrollView>
        }
      </SafeAreaView>
    );
  }
}

const mapStateToProps = state => ({ generalInfo: state.general.info, loggedInUser: state.user });

export default connect(mapStateToProps, {
  userLogin
})(ProfileScreen);