import * as actionTypes from '../actions/types';

const initialState = {
  info: undefined,
  lastUpdate: undefined,
  fcmToken: undefined
};

const generalReducer = (state = initialState, action) => {
  switch(action.type) {
    case actionTypes.UPDATE_GENERAL_INFO:
      return {
        ...state,
        info: action.payload.info,
        lastUpdate: new Date()
      };
    case actionTypes.UPDATE_FCM_DEVICE_TOKEN:
      return {
        ...state,
        fcmToken: action.payload.fcmToken,
      };
    default:
      return state;
  }
}

export default generalReducer;