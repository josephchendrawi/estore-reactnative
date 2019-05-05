import * as actionTypes from '../actions/types';

const initialState = {
  userName: undefined,
  lastLogin: undefined,
  accessToken: undefined,
  isFcmTokenSent: undefined,
};

const userReducer = (state = initialState, action) => {
  switch(action.type) {
    case actionTypes.USER_LOGIN:
      return {
        ...state,
        userName: action.payload.userName,
        lastLogin: action.payload.lastLogin,
        accessToken: action.payload.accessToken,
        isFcmTokenSent: undefined,
      };
    case actionTypes.USER_LOGOUT:
      return {
        ...state,
        userName: undefined,
        lastLogin: undefined,
        accessToken: undefined,
        isFcmTokenSent: undefined,
      };
    case actionTypes.UPDATE_FCM_TOKEN_SENT_FLAG:
      return {
        ...state,
        isFcmTokenSent: action.payload.isFcmTokenSent,
      };
    default:
      return state;
  }
}

export default userReducer;