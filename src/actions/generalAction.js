import * as actionTypes from './types';

export const updateGeneralInfo = (info) => {
  return {
    type: actionTypes.UPDATE_GENERAL_INFO,
    payload: { info: info }
  }
}

export const updateFcmToken = (fcmToken) => {
  return {
    type: actionTypes.UPDATE_FCM_DEVICE_TOKEN,
    payload: { fcmToken: fcmToken }
  }
}