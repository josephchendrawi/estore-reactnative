import * as actionTypes from './types';

export const userLogin = (userName, lastLogin, accessToken) => {
  return {
    type: actionTypes.USER_LOGIN,
    payload: { userName: userName, lastLogin: lastLogin, accessToken: accessToken }
  }
}

export const userLogout = () => {
  return {
    type: actionTypes.USER_LOGOUT,
    payload: {}
  }
}

export const updateFcmTokenSentFlag = (isFcmTokenSent) => {
  return {
    type: actionTypes.UPDATE_FCM_TOKEN_SENT_FLAG,
    payload: { isFcmTokenSent: isFcmTokenSent }
  }
}