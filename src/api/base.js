import {
    Platform
} from 'react-native';

import md5 from 'md5';

import DeviceInfo from 'react-native-device-info';

const axios = require('axios');

const mainAPI = axios.create({
    baseURL: "https://resellerapi.azurewebsites.net"
});
const TOKEN = "49dfb47e-8e57-4ffd-a323-d928ebed1016";
const DEVICE = DeviceInfo.getUniqueID();
const PLATFORM = Platform.OS.toUpperCase();

export function signalr_url(email, accesstoken){
    var signature = md5('accesstoken=' + accesstoken + '&device=' + DEVICE + '&email=' + email + '&platform=' + PLATFORM + '&token=' + TOKEN);

    return "https://resellercms.azurewebsites.net/notificationhub?email=" + email + "&platform=" + PLATFORM + "&device=" + DEVICE + "&accesstoken=" + accesstoken + "&signature=" + signature;
}

export function generateSignature(parameter){
    var keys = Object.keys(parameter).sort();

    signatureString = "";
    keys.map((key) => {
        if(signatureString != "") signatureString += "&";
        signatureString += key + "=" + parameter[key];
    })
    signatureString += '&token=' + TOKEN;

    return md5(signatureString);
}

export async function GetCustomerLoginRequest(email, password, devicetoken){
    var signature = md5('device=' + DEVICE + '&devicetoken=' + devicetoken + '&email=' + email + '&password=' + password + '&platform=' + PLATFORM + '&token=' + TOKEN);

    return mainAPI.post("/customer/login", {
        email: email,
        password: password,
        platform: PLATFORM,
        device: DEVICE,
        devicetoken: devicetoken,
        signature: signature
    })
}

export async function GetCustomerRenewTokenRequest(email, accesstoken){
    var signature = md5('accesstoken=' + accesstoken + '&device=' + DEVICE + '&email=' + email + '&platform=' + PLATFORM + '&token=' + TOKEN);

    return mainAPI.post("/customer/renewtoken", {
        email: email,
        platform: PLATFORM,
        device: DEVICE,
        accesstoken: accesstoken,
        signature: signature
    })
}

export async function GetCustomerProfileRequest(email, accesstoken){
    var signature = md5('accesstoken=' + accesstoken + '&device=' + DEVICE + '&email=' + email + '&platform=' + PLATFORM + '&token=' + TOKEN);

    return mainAPI.post("/customer/profile", {
        email: email,
        platform: PLATFORM,
        device: DEVICE,
        accesstoken: accesstoken,
        signature: signature
    })
}

export async function GetBannerRequest(){
    var signature = md5('token=' + TOKEN);

    return mainAPI.get("/banner", {
        signature: signature
    })
}

export async function GetCountryRequest(){
    var signature = md5('token=' + TOKEN);

    return mainAPI.get("/country", {
        signature: signature
    })
}

export async function GetProvinsiRequest(country_id){
    var signature = md5('country_id='+ country_id + '&token=' + TOKEN);

    return mainAPI.post("/provinsi", {
        country_id: country_id,
        signature: signature
    })
}

export async function GetKabupatenRequest(provinsi_id){
    var signature = md5('provinsi_id='+ provinsi_id + '&token=' + TOKEN);

    return mainAPI.post("/kabupaten", {
        provinsi_id: provinsi_id,
        signature: signature
    })
}

export async function GetCityRequest(kabupaten_id){
    var signature = md5('kabupaten_id='+ kabupaten_id + '&token=' + TOKEN);

    return mainAPI.post("/city", {
        kabupaten_id: kabupaten_id,
        signature: signature
    })
}

export async function GetCategoryParentRequest(){
    var signature = md5('token=' + TOKEN);

    return mainAPI.post("/category", {
        signature: signature
    })
}

export async function GetCategoryChildRequest(parent_id){
    var signature = md5('parent_id=' + parent_id + '&token=' + TOKEN);

    return mainAPI.post("/category/" + parent_id, {
        parent_id: parent_id,
        signature: signature
    })
}

export async function GetProductRequest(name, category_id, type, page, pagesize, email){
    var signature = md5('category_id=' + category_id + '&name=' + name + '&page=' + page + '&pagesize=' + pagesize + '&type=' + type + '&token=' + TOKEN);

    return mainAPI.post("/product", {
        name: name,
        category_id: category_id,
        type: type,
        page: page,
        pagesize: pagesize,
        email: email,
        signature: signature
    })
}

export async function GetProductDetailRequest(product_id, email){
    var signature = md5('product_id=' + product_id + '&token=' + TOKEN);

    return mainAPI.post("/product/detail", {
        product_id: product_id,
        email: email,
        signature: signature
    })
}

export async function SetCustomerRequest(email, password, fullname, contact, address, cityid, zipcode){
    var signature = md5('address=' + address + '&cityid=' + cityid + '&contact=' + contact + '&device=' + DEVICE + '&email=' + email + '&fullname=' + fullname + '&password=' + password + '&platform=' + PLATFORM + '&zipcode=' + zipcode + '&token=' + TOKEN);

    return mainAPI.post("/customer/add", {
        address: address,
        cityid: cityid,
        contact: contact,
        device: DEVICE,
        email: email,
        fullname: fullname,
        password: password,
        platform: PLATFORM,
        zipcode: zipcode,
        signature: signature
    })
}

export async function SetOrderRequest(detail, remarks, email, accesstoken){
    var signatureString = 'accesstoken=' + accesstoken + '&device=' + DEVICE + '&email=' + email + '&platform=' + PLATFORM;
    signatureString += '&remarks=' + (remarks == undefined ? "" : remarks);
    signatureString += '&token=' + TOKEN;
    var signature = md5(signatureString);

    return mainAPI.post("/order/add", {
        detail: detail,
        remarks: remarks,
        email: email,
        platform: PLATFORM,
        device: DEVICE,
        accesstoken: accesstoken,
        signature: signature
    })
}

export async function GetSendOtpEmailRequest(email){
    var signature = md5('email='+ email + '&token=' + TOKEN);

    return mainAPI.post("/customer/sendotpemail", {
        email: email,
        signature: signature
    })
}

export async function GetSendOtpSMSRequest(email){
    var signature = md5('phone='+ phone + '&token=' + TOKEN);

    return mainAPI.post("/customer/sendotpcontact", {
        phone: phone,
        signature: signature
    })
}

export async function GetCustomerVerifyEmailRequest(email, code){
    var signature = md5('code='+ code + '&email=' + email + '&token=' + TOKEN);

    return mainAPI.post("/customer/verifyemail", {
        code: code,
        email: email,
        signature: signature
    })
}

export async function GetCustomerVerifyContactRequest(phone, code){
    var signature = md5('code='+ code + '&phone=' + phone + '&token=' + TOKEN);

    return mainAPI.post("/customer/verifycontact", {
        code: code,
        phone: phone,
        signature: signature
    })
}

export async function GetCustomerForgotPassEmailRequest(email, code, password){
    var signature = md5('code='+ code + '&email=' + email + '&password=' + password + '&token=' + TOKEN);

    return mainAPI.post("/customer/forgotpassemail", {
        code: code,
        email: email,
        password: password,
        signature: signature
    })
}

export async function GetCustomerForgotPassContactRequest(phone, code, password){
    var signature = md5('code='+ code + '&password=' + password + '&phone=' + phone + '&token=' + TOKEN);

    return mainAPI.post("/customer/forgotpasscontact", {
        code: code,
        phone: phone,
        password: password,
        signature: signature
    })
}

export async function GetInfoRequest(){
    return mainAPI.get("/info")
}

export async function GetCheckStockRequest(variant_id, qty, email, accesstoken){
    var signature = md5('accesstoken=' + accesstoken + '&device=' + DEVICE + '&email=' + email + '&platform=' + PLATFORM + '&qty=' + qty + '&variant_id=' + variant_id + '&token=' + TOKEN);

    return mainAPI.post("/order/checkstock", {
        variant_id: variant_id,
        qty: qty,
        email: email,
        platform: PLATFORM,
        device: DEVICE,
        accesstoken: accesstoken,
        signature: signature
    })
}

export async function GetCourierPriceRequest(courier_id, city_id){
    var signature = md5('city_id=' + city_id + '&courier_id=' + courier_id + '&token=' + TOKEN);

    return mainAPI.post("/courierprice", {
        city_id: city_id,
        courier_id: courier_id,
        signature: signature
    })
}

export async function GetCourierRequest(){
    var signature = md5('token=' + TOKEN);

    return mainAPI.post("/courier", {
        signature: signature
    })
}

export async function GetOrderRequest(order_id, order_status, from_date, to_date, page, pagesize, email, accesstoken){
    var signature = md5('accesstoken=' + accesstoken + '&device=' + DEVICE + '&email=' + email + '&from_date=' + from_date + '&order_id=' + order_id + '&order_status=' + order_status + '&page=' + page + '&pagesize=' + pagesize + '&platform=' + PLATFORM + '&to_date=' + to_date + '&token=' + TOKEN);

    return mainAPI.post("/order", {
        order_id: order_id,
        order_status: order_status,
        from_date: from_date,
        to_date: to_date,
        page: page,
        pagesize: pagesize,
        email: email,
        platform: PLATFORM,
        device: DEVICE,
        accesstoken: accesstoken,
        signature: signature
    })
}

export async function GetOrderNewRequest(email, accesstoken){
    var signature = md5('accesstoken=' + accesstoken + '&device=' + DEVICE + '&email=' + email + '&platform=' + PLATFORM + '&token=' + TOKEN);

    return mainAPI.post("/order/new", {
        email: email,
        platform: PLATFORM,
        device: DEVICE,
        accesstoken: accesstoken,
        signature: signature
    })
}

export async function SetCustomerProfileRequest(fullname, contact, address, cityid, zipcode, email, accesstoken){
    var signature = md5('accesstoken=' + accesstoken + '&address=' + address + '&cityid=' + cityid + '&contact=' + contact + '&device=' + DEVICE + '&email=' + email + '&fullname=' + fullname + '&platform=' + PLATFORM + '&zipcode=' + zipcode + '&token=' + TOKEN);

    return mainAPI.post("/customer/profile/edit", {
        fullname: fullname,
        contact: contact,
        address: address,
        cityid: cityid,
        zipcode: zipcode,
        email: email,
        platform: PLATFORM,
        device: DEVICE,
        accesstoken: accesstoken,
        signature: signature
    })
}

export async function SetOrderDropshipRequest(full_name, order_id, city_id, contact, address, zipcode, courierprice_id, email, accesstoken){
    var order_idInString = order_id.join(',');
    var signature = md5('accesstoken=' + accesstoken + '&address=' + address + '&city_id=' + city_id + '&contact=' + contact + '&courierprice_id=' + courierprice_id + '&device=' + DEVICE + '&email=' + email + '&full_name=' + full_name + '&order_id=' + order_idInString + '&platform=' + PLATFORM + '&zipcode=' + zipcode + '&token=' + TOKEN);

    return mainAPI.post("/order/updatedropship", {
        full_name: full_name,
        order_id: order_id,
        city_id: city_id,
        contact: contact,
        address: address,
        zipcode: zipcode,
        courierprice_id: courierprice_id,
        email: email,
        platform: PLATFORM,
        device: DEVICE,
        accesstoken: accesstoken,
        signature: signature
    })
}

export async function SetOrderConfirmRequest(order_id, email, accesstoken){
    var order_idInString = order_id.join(',');
    var signature = md5('accesstoken=' + accesstoken + '&device=' + DEVICE + '&email=' + email + '&order_id=' + order_idInString + '&platform=' + PLATFORM + '&token=' + TOKEN);

    return mainAPI.post("/order/updateconfirm", {
        order_id: order_id,
        email: email,
        platform: PLATFORM,
        device: DEVICE,
        accesstoken: accesstoken,
        signature: signature
    })
}

export async function SetOrderPaymentRequest(order_id, payment_type, payment_proof, email, accesstoken){
    var signature = md5('accesstoken=' + accesstoken + '&device=' + DEVICE + '&email=' + email + '&order_id=' + order_id + '&payment_type=' + payment_type + '&platform=' + PLATFORM + '&token=' + TOKEN);

    return mainAPI.post("/order/updatepayment", {
        order_id: order_id,
        payment_type: payment_type,
        payment_proof: payment_proof,
        email: email,
        platform: PLATFORM,
        device: DEVICE,
        accesstoken: accesstoken,
        signature: signature
    })
}

export async function GetPaymentTypeRequest(){
    return mainAPI.get("/paymenttype", {
    })
}

export async function GetCustomerChatRequest(page, pagesize, email, accesstoken){
    var signature = md5('accesstoken=' + accesstoken + '&device=' + DEVICE + '&email=' + email + '&page=' + page + '&pagesize=' + pagesize + '&platform=' + PLATFORM + '&token=' + TOKEN);

    return mainAPI.post("/chat", {
        page: page,
        pagesize: pagesize,
        email: email,
        platform: PLATFORM,
        device: DEVICE,
        accesstoken: accesstoken,
        signature: signature
    })
}

export async function SetCustomerFcmToken(fcmtoken, email, accesstoken){
    var signature = md5('accesstoken=' + accesstoken + '&device=' + DEVICE + '&email=' + email + '&fcmtoken=' + fcmtoken + '&platform=' + PLATFORM + '&token=' + TOKEN);

    return mainAPI.post("/customer/fcmtoken/add", {
        fcmtoken: fcmtoken,
        email: email,
        platform: PLATFORM,
        device: DEVICE,
        accesstoken: accesstoken,
        signature: signature
    })
}