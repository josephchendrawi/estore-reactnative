import * as actionTypes from '../actions/types';

const initialState = {
  selectedItemList: [],
};

const cartReducer = (state = initialState, action) => {
  switch(action.type) {
    case actionTypes.CART_SELECTION_UPDATE:
      if(action.payload.newValue === true){
        return {
          ...state,
          selectedItemList: [...state.selectedItemList, action.payload.item]
        }
      }
      else if(action.payload.newValue === false){
        return {
          ...state,
          selectedItemList: state.selectedItemList.filter(i => i.id != action.payload.item.id)
        }
      }
    case actionTypes.CART_SELECTION_CLEAR:
      return {
        ...state,
        selectedItemList: []
      };
    default:
      return state;
  }
}

export default cartReducer;